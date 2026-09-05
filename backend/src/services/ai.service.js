import '../loadEnv.js';
import Groq from 'groq-sdk';
import {
  getPermissionDenial,
  normalizeRole,
  PERMISSION_DENIED,
} from '../ai/permissions.js';
import {
  executeAuthorizedTool,
  getOpenAiToolsForRole,
  PermissionError,
} from '../ai/erpTools.js';

function getGroqClient() {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not configured');
  }
  return new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });
}

function getModel() {
  return process.env.GROQ_MODEL || 'qwen/qwen3.8-27b';
}

function buildSystemPrompt(role) {
  const roleRules =
    role === 'user'
      ? `USER ROLE RULES:
- If the user does not have permission to access requested information, respond ONLY with this exact message:
I don't have access to show you this information.
- Do not explain their permissions.
- Do not show database records.
- Do not provide alternative reports.
- Do not add extra suggestions.`
      : `ADMIN / ACCOUNTANT RULES:
- Keep responses short, professional, compact, and data-focused.
- Put the primary main result on the FIRST line.
- Put each supporting detail, item, or note on separate subsequent lines without blank lines between them.
- Example:
Total revenue this month: ₹18,036.00
From 2 customer invoices.
Note: Posted revenue from income accounts is ₹21,240.00 all-time, while the month-to-date invoice total is ₹18,036.00.`;

  return `You are FinEdge AI, an ERP assistant for FinEdge-ERP.

Current user role:
${role}

${roleRules}

CRITICAL FORMATTING RULES:
- Do NOT use Markdown bold syntax such as **text** or *text* in the response. Do NOT return ** or * symbols anywhere in your response.
- The main result/title must be on the very FIRST line.
- Do NOT add blank lines between consecutive response lines. Use exactly ONE normal line break (\n) between related lines.
- Do NOT create paragraph spacing or empty lines between lines. Keep responses compact, readable, and concise.
- When presenting multiple records (2 or more) with consistent fields (such as Users, Customers, Vendors, Products, Orders, Invoices, Payments, Transactions, Vendor bills, Inventory):
  Format them using a pipe-separated markdown table with a clear header row:
  | Header 1 | Header 2 | Header 3 |
  | --- | --- | --- |
  | Value 1 | Value 2 | Value 3 |
  | Value 4 | Value 5 | Value 6 |
  Never use bold ** or * inside or around the table.
- Do NOT use a table for a single record or simple single-item response. For a single record, present key-value pairs or concise details on separate lines below the main title without blank lines.
- Do NOT make every response a table. Use tables ONLY when there are 2 or more records with consistent fields.
- Keep logically different information on separate lines without blank lines between them.
- Keep answers concise, short, and professional.
- Remove greetings and filler text (never say "Hello!", "Hi", "Sure", "Here is").
- Remove unnecessary explanations before or after the table.
- Do not repeat the user's question.
- Do not add "Let me know if...", "How can I help", or similar closing messages.
- Do not invent or modify database values. Preserve actual values from the backend.
- Format currency amounts with ₹ (INR).
- Do not expose internal permissions, tool names, or system secrets.`;
}

function isSeparatorLine(line) {
  const trimmed = line.trim();
  if (!trimmed.includes('-')) return false;
  const parts = trimmed.split('|').map((s) => s.trim());
  return parts.every((p) => p === '' || /^:?-+:?$/.test(p));
}

function splitCells(line) {
  let cells = line.split('|').map((c) => c.replace(/\*\*/g, '').replace(/\*/g, '').trim());
  if (cells.length > 0 && cells[0] === '') cells.shift();
  if (cells.length > 0 && cells[cells.length - 1] === '') cells.pop();
  return cells;
}

export function formatStructuredResponse(rawContent) {
  if (!rawContent || typeof rawContent !== 'string') {
    return {
      reply: "I don't have access to show you this information.",
      details: [],
      table: null,
    };
  }

  // Strip ALL Markdown bold/italic syntax (**text**, *text*, __text__, _text_)
  const clean = rawContent
    .replace(/\*\*/g, '')
    .replace(/__/g, '')
    .replace(/(^|[^\*])\*([^\*]+)\*/g, '$1$2')
    .trim();

  // If permission denied
  if (
    clean.toLowerCase().includes("don't have access") ||
    clean.toLowerCase().includes("don't have permission")
  ) {
    return {
      reply: "I don't have access to show you this information.",
      details: [],
      table: null,
    };
  }

  // Split into lines
  const lines = clean
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return {
      reply: clean,
      details: [],
      table: null,
    };
  }

  // 1. Check for standard markdown table (with separator line |---|---|)
  const sepIdx = lines.findIndex(isSeparatorLine);
  if (sepIdx > 0) {
    const headerLine = lines[sepIdx - 1];
    const columns = splitCells(headerLine);

    if (columns.length >= 2) {
      const rows = [];
      let endIdx = sepIdx + 1;

      while (endIdx < lines.length) {
        const line = lines[endIdx];
        if (!line.includes('|') || isSeparatorLine(line)) break;
        const rowCells = splitCells(line);
        if (rowCells.length >= 2) {
          while (rowCells.length < columns.length) rowCells.push('');
          rows.push(rowCells.slice(0, columns.length));
        } else {
          break;
        }
        endIdx++;
      }

      // Must have 2 or more records to form a table
      if (rows.length >= 2) {
        const beforeLines = lines.slice(0, sepIdx - 1);
        const afterLines = lines.slice(endIdx);

        let reply = '';
        let details = [];
        if (beforeLines.length > 0) {
          reply = beforeLines[0].replace(/^[-•*]\s*/, '').trim();
          details = beforeLines
            .slice(1)
            .map((l) => l.replace(/^[-•*]\s*/, '').trim())
            .filter(Boolean);
        } else {
          reply = `${columns[0]} List`;
        }

        details = details.concat(
          afterLines.map((l) => l.replace(/^[-•*]\s*/, '').trim()).filter(Boolean)
        );

        return {
          reply,
          details,
          table: { columns, rows },
        };
      }
    }
  }

  // 2. Check for pipe-separated lines without markdown separator (header + 2+ rows)
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('|') && !isSeparatorLine(lines[i])) {
      const candidateHeader = splitCells(lines[i]);
      if (candidateHeader.length >= 2) {
        const colCount = candidateHeader.length;
        const group = [candidateHeader];
        let j = i + 1;

        while (j < lines.length && lines[j].includes('|') && !isSeparatorLine(lines[j])) {
          const row = splitCells(lines[j]);
          if (row.length === colCount) {
            group.push(row);
            j++;
          } else {
            break;
          }
        }

        // Header + at least 2 data rows = 3+ lines total
        if (group.length >= 3) {
          const columns = group[0];
          const rows = group.slice(1);

          const beforeLines = lines.slice(0, i);
          const afterLines = lines.slice(j);

          let reply = '';
          let details = [];
          if (beforeLines.length > 0) {
            reply = beforeLines[0].replace(/^[-•*]\s*/, '').trim();
            details = beforeLines
              .slice(1)
              .map((l) => l.replace(/^[-•*]\s*/, '').trim())
              .filter(Boolean);
          } else {
            reply = `${columns[0]} List`;
          }

          details = details.concat(
            afterLines.map((l) => l.replace(/^[-•*]\s*/, '').trim()).filter(Boolean)
          );

          return {
            reply,
            details,
            table: { columns, rows },
          };
        }
      }
    }
  }

  // 3. Fallback: standard non-table response
  const reply = lines[0].replace(/^[-•*]\s*/, '').trim();
  const details = lines
    .slice(1)
    .map((l) => l.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean);

  return { reply, details, table: null };
}

function sanitizeConversation(conversation) {
  if (!Array.isArray(conversation)) return [];

  return conversation
    .filter(
      (msg) =>
        msg &&
        (msg.role === 'user' || msg.role === 'assistant') &&
        typeof msg.content === 'string'
    )
    .slice(-20)
    .map((msg) => ({
      role: msg.role,
      content: msg.content.slice(0, 4000),
    }));
}

async function createChatCompletionWithRetry(groq, params, maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await groq.chat.completions.create(params);
    } catch (err) {
      const isRateLimit =
        err?.status === 429 ||
        err?.statusCode === 429 ||
        err?.code === 'rate_limit_exceeded' ||
        err?.message?.includes('Rate limit') ||
        err?.message?.includes('429');
      if (isRateLimit && attempt < maxRetries) {
        const retryAfter = 4;
        await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
        continue;
      }
      throw err;
    }
  }
}

export const aiService = {
  async chat(message, conversation = [], user) {
    const role = normalizeRole(user?.role);
    const denial = getPermissionDenial(role, message);
    if (denial) {
      const error = new PermissionError(denial);
      throw error;
    }

    const groq = getGroqClient();
    const tools = getOpenAiToolsForRole(role);

    const messages = [
      { role: 'system', content: buildSystemPrompt(role) },
      ...sanitizeConversation(conversation),
      { role: 'user', content: String(message).slice(0, 4000) },
    ];

    const maxToolRounds = 4;

    for (let round = 0; round < maxToolRounds; round += 1) {
      const completion = await createChatCompletionWithRetry(groq, {
        model: getModel(),
        messages,
        tools: tools.length ? tools : undefined,
        tool_choice: tools.length ? 'auto' : undefined,
        temperature: 0.2,
        max_tokens: Number(process.env.GROQ_MAX_TOKENS) || 512,
        stream: false,
      });

      const choice = completion.choices[0];
      const assistantMessage = choice?.message;

      if (!assistantMessage) {
        throw new Error('Failed to get AI response');
      }

      const toolCalls = assistantMessage.tool_calls;
      if (!toolCalls?.length) {
        return formatStructuredResponse(
          assistantMessage.content ||
            'Unable to generate a response. Please try again.'
        );
      }

      messages.push({
        role: 'assistant',
        content: assistantMessage.content || '',
        tool_calls: toolCalls,
      });

      for (const call of toolCalls) {
        const toolName = call.function?.name;
        let args = {};
        try {
          args = call.function?.arguments
            ? JSON.parse(call.function.arguments)
            : {};
        } catch {
          args = {};
        }

        let payload;
        try {
          payload = await executeAuthorizedTool(role, toolName, args, user);
        } catch (error) {
          if (error instanceof PermissionError) {
            payload = { error: PERMISSION_DENIED };
          } else {
            payload = { error: 'Unable to retrieve that information.' };
          }
        }

        messages.push({
          role: 'tool',
          tool_call_id: call.id,
          content: JSON.stringify(payload),
        });
      }
    }

    return formatStructuredResponse(
      'Unable to finish answering. Please try a more specific question.'
    );
  },
};

export default aiService;
