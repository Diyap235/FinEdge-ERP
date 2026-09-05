import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Send,
  Sparkles,
  Bot,
  ChevronRight,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { aiAPI } from '../../services/api';
import ErpTable from '../common/ErpTable';

/* ── Suggestion prompts ─────────────────────────────────────────── */
const SUGGESTIONS_BY_ROLE = {
  admin: [
    "Show me today's sales",
    'Show me total revenue this month',
    'Show me low stock products',
    'Show me pending invoices',
  ],
  accountant: [
    'Show me pending invoices',
    'Show me vendor bills',
    'Show me payments',
    "Show me today's sales",
  ],
  contact: [
    'Show me my orders',
    'Show me my invoices',
    'Show me products',
    'What is the status of my latest order?',
  ],
  user: [
    'Show me my orders',
    'Show me my invoices',
    'Show me products',
    'What is the status of my latest order?',
  ],
};

/* ── Client-side table fallback parser (for 2+ records) ──────────── */
function parseClientTable(lines) {
  if (!Array.isArray(lines) || lines.length < 3) return null;

  const clean = (s) => (s ? String(s).replace(/\*\*/g, '').replace(/\*/g, '').trim() : '');

  const isSep = (l) => {
    const t = l.trim();
    if (!t.includes('-')) return false;
    return t.split('|').map((s) => s.trim()).every((p) => p === '' || /^:?-+:?$/.test(p));
  };

  const splitCells = (l) => {
    let c = l.split('|').map(clean);
    if (c.length > 0 && c[0] === '') c.shift();
    if (c.length > 0 && c[c.length - 1] === '') c.pop();
    return c;
  };

  // 1. Markdown table with separator line
  const sepIdx = lines.findIndex(isSep);
  if (sepIdx > 0) {
    const columns = splitCells(lines[sepIdx - 1]);
    if (columns.length >= 2) {
      const rows = [];
      let i = sepIdx + 1;
      while (i < lines.length) {
        if (!lines[i].includes('|') || isSep(lines[i])) break;
        const r = splitCells(lines[i]);
        if (r.length >= 2) {
          while (r.length < columns.length) r.push('');
          rows.push(r.slice(0, columns.length));
        } else break;
        i++;
      }
      if (rows.length >= 2) {
        const remaining = [...lines.slice(0, sepIdx - 1), ...lines.slice(i)];
        return { table: { columns, rows }, remaining };
      }
    }
  }

  // 2. Pipe-separated lines (header + 2+ rows)
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('|') && !isSep(lines[i])) {
      const header = splitCells(lines[i]);
      if (header.length >= 2) {
        const rows = [];
        let j = i + 1;
        while (j < lines.length && lines[j].includes('|') && !isSep(lines[j])) {
          const r = splitCells(lines[j]);
          if (r.length === header.length) {
            rows.push(r);
            j++;
          } else break;
        }
        if (rows.length >= 2) {
          const remaining = [...lines.slice(0, i), ...lines.slice(j)];
          return { table: { columns: header, rows }, remaining };
        }
      }
    }
  }

  return null;
}

/* ── Single chat message bubble ────────────────────────────────── */
function MessageBubble({ role, text, reply, details, table }) {
  const isUser = role === 'user';

  // Strip any accidental markdown asterisks so they are NEVER displayed
  const stripAsterisks = (s) =>
    s ? String(s).replace(/\*\*/g, '').replace(/\*/g, '').trim() : '';

  let mainTitle = '';
  let subDetails = [];
  let tableData = null;

  if (isUser) {
    mainTitle = text || reply || '';
  } else {
    // Assistant message
    let rawTitle = '';
    let rawDetails = [];

    if (reply !== undefined && reply !== null) {
      rawTitle = stripAsterisks(reply);
      rawDetails = Array.isArray(details) ? details : [];
    } else if (typeof text === 'string') {
      const lines = text.split('\n').map(stripAsterisks).filter(Boolean);
      rawTitle = lines[0] || '';
      rawDetails = lines.slice(1);
    }

    // Split any multi-line string in rawTitle so the main title is strictly the first line
    const titleLines = rawTitle.split('\n').map(stripAsterisks).filter(Boolean);
    mainTitle = titleLines[0] || '';
    const extraTitleLines = titleLines.slice(1);

    // Flatten any multi-line strings in rawDetails into individual clean lines without blanks
    const flatDetails = [
      ...extraTitleLines,
      ...rawDetails.flatMap((d) =>
        typeof d === 'string'
          ? d.split('\n').map(stripAsterisks).filter(Boolean)
          : [stripAsterisks(d)]
      ),
    ].filter(Boolean);

    // Direct table from backend payload
    if (
      table &&
      Array.isArray(table.columns) &&
      table.columns.length >= 2 &&
      Array.isArray(table.rows) &&
      table.rows.length >= 2
    ) {
      tableData = table;
      subDetails = flatDetails;
    } else {
      // Fallback: detect table in flatDetails
      const parsed = parseClientTable(flatDetails);
      if (parsed) {
        tableData = parsed.table;
        subDetails = parsed.remaining.map(stripAsterisks).filter(Boolean);
      } else {
        subDetails = flatDetails;
      }
    }
  }

  const hasTable = Boolean(tableData && tableData.rows?.length >= 2);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: 10,
      }}
    >
      {/* AI avatar — only on assistant messages */}
      {!isUser && (
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 10,
            flexShrink: 0,
            background: 'linear-gradient(135deg,#0F6A4B,#1a8a60)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 8,
            marginTop: 2,
            boxShadow: '0 2px 6px rgba(15,106,75,0.3)',
          }}
        >
          <Bot size={14} color="white" />
        </div>
      )}
      <div
        style={{
          maxWidth: !isUser && hasTable ? '95%' : '82%',
          width: !isUser && hasTable ? '95%' : 'auto',
          padding: '10px 14px',
          borderRadius: isUser ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
          background: isUser
            ? 'linear-gradient(135deg,#0F6A4B,#1a8a60)'
            : '#f5f2eb',
          color: isUser ? '#fff' : '#222',
          fontSize: 13,
          lineHeight: 1.5,
          boxShadow: isUser
            ? '0 2px 8px rgba(15,106,75,0.25)'
            : '0 1px 3px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}
      >
        {isUser ? (
          <div style={{ margin: 0, padding: 0, lineHeight: 1.5 }}>{mainTitle}</div>
        ) : (
          <div style={{ margin: 0, padding: 0, lineHeight: 1.5 }}>
            {mainTitle && (
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 13.5,
                  color: '#1c1c1e',
                  margin: 0,
                  padding: 0,
                  lineHeight: 1.5,
                  marginBottom: hasTable ? 6 : 0,
                }}
              >
                {mainTitle}
              </div>
            )}

            {hasTable && (
              <ErpTable columns={tableData.columns} rows={tableData.rows} />
            )}

            {subDetails.map((detail, idx) => (
              <div
                key={idx}
                style={{
                  fontWeight: 400,
                  fontSize: 12.5,
                  color: '#333',
                  margin: 0,
                  padding: 0,
                  lineHeight: 1.5,
                  marginTop: idx === 0 && hasTable ? 6 : 0,
                }}
              >
                {detail}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main AI Panel component ────────────────────────────────────── */
export default function AiPanel({ onClose, userName = 'Arjun', role = 'admin' }) {
  const SUGGESTIONS = SUGGESTIONS_BY_ROLE[role] || SUGGESTIONS_BY_ROLE.admin;
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  /* Auto-scroll to bottom whenever messages change */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  /* Send message to AI API */
  const handleSend = async (text) => {
    const query = (text ?? input).trim();
    if (!query) return;

    setInput('');
    setError(null);
    
    // Add user message to UI
    const userMessage = { role: 'user', text: query };
    setMessages(prev => [...prev, userMessage]);
    setTyping(true);

    try {
      // Build conversation history for API
      const conversation = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content:
          msg.text ||
          [msg.reply, ...(msg.details || [])].filter(Boolean).join('\n'),
      }));

      // Call AI API
      const response = await aiAPI.chat(query, conversation);
      
      setTyping(false);
      
      if (response.data.success) {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            reply: response.data.reply,
            details: Array.isArray(response.data.details) ? response.data.details : [],
            table: response.data.table || null,
          },
        ]);
      } else {
        throw new Error(response.data.error || 'Failed to get response');
      }
    } catch (err) {
      setTyping(false);
      const isPermissionDenied =
        err.response?.status === 403 ||
        err.response?.data?.error?.includes('permission') ||
        err.response?.data?.error?.includes("don't have access");

      if (isPermissionDenied) {
        const replyText =
          err.response?.data?.error ||
          "I don't have access to show you this information.";
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', reply: replyText, details: [] },
        ]);
      } else {
        const errorMessage =
          err.response?.data?.error ||
          err.message ||
          'Failed to connect to AI service';
        setError(errorMessage);

        // Add error message to chat
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            reply: `Sorry, I encountered an error: ${errorMessage}. Please try again.`,
            details: [],
          },
        ]);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <motion.div
      key="ai-panel"
      initial={{ x: 420, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 420, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: 420,
        height: '100vh',
        background: '#fff',
        borderLeft: '1px solid #e8e3d8',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 45,
        boxShadow: '-4px 0 32px rgba(0,0,0,0.08)',
        overflow: 'hidden',
      }}
    >

      {/* ── Header ──────────────────────────────────────────────── */}
      <div
        style={{
          padding: '16px 18px',
          borderBottom: '1px solid #ede9e0',
          flexShrink: 0,
          background: 'linear-gradient(135deg, #0F6A4B 0%, #1a7a55 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Avatar */}
            <div
              style={{
                width: 36, height: 36, borderRadius: 12,
                background: 'rgba(255,255,255,0.20)',
                border: '1.5px solid rgba(255,255,255,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Sparkles size={17} color="white" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '-0.2px' }}>
                  FinEdge AI Copilot
                </span>
                {/* Beta badge */}
                <span
                  style={{
                    fontSize: 9, fontWeight: 800, letterSpacing: '0.6px',
                    background: 'rgba(255,255,255,0.22)',
                    color: '#fff',
                    padding: '2px 6px', borderRadius: 6,
                    textTransform: 'uppercase',
                    border: '1px solid rgba(255,255,255,0.3)',
                  }}
                >
                  Beta
                </span>
              </div>
              <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.75)', margin: '1px 0 0', lineHeight: 1 }}>
                Your accounting copilot
              </p>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              width: 30, height: 30, borderRadius: 10,
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.25)',
              cursor: 'pointer', boxShadow: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', padding: 0,
              flexShrink: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            aria-label="Close AI panel"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* ── Scrollable body ─────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '18px 16px 0',
          scrollbarWidth: 'thin',
          scrollbarColor: '#d6d1c9 transparent',
        }}
      >

        {/* ── Greeting card (shown when no messages yet) ─────────── */}
        {!hasMessages && (
          <div
            style={{
              background: 'linear-gradient(135deg,#f0f9f5,#e6f5ef)',
              borderRadius: 16,
              padding: '14px 16px',
              marginBottom: 16,
              border: '1px solid #c5e8d8',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
            }}
          >
            {/* User avatar */}
            <div
              style={{
                width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                background: 'linear-gradient(135deg,#c47a1a,#e8a020)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, color: '#fff',
                boxShadow: '0 2px 6px rgba(196,122,26,0.35)',
              }}
            >
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 700, color: '#1c1c1e' }}>
                Hi {userName}!
              </p>
              <p style={{ margin: 0, fontSize: 12.5, color: '#666', lineHeight: 1.45 }}>
                How can I help you today?
              </p>
            </div>
          </div>
        )}

        {/* ── Suggestion buttons (shown when no messages yet) ────── */}
        {!hasMessages && (
          <div style={{ marginBottom: 16 }}>
            <p
              style={{
                fontSize: 10.5, fontWeight: 700, color: '#aaa',
                textTransform: 'uppercase', letterSpacing: '0.6px',
                margin: '0 0 8px',
              }}
            >
              Quick Actions
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  style={{
                    width: '100%', textAlign: 'left',
                    background: '#faf8f4',
                    border: '1px solid #ede9e0',
                    borderRadius: 12,
                    padding: '9px 14px',
                    fontSize: 13, color: '#333',
                    cursor: 'pointer', boxShadow: 'none',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', gap: 8,
                    transition: 'background 0.12s, border-color 0.12s',
                    fontFamily: 'inherit',
                    fontWeight: 500,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#e6f5ef';
                    e.currentTarget.style.borderColor = '#a8d8c0';
                    e.currentTarget.style.color = '#0F6A4B';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#faf8f4';
                    e.currentTarget.style.borderColor = '#ede9e0';
                    e.currentTarget.style.color = '#333';
                  }}
                >
                  <span>{s}</span>
                  <ChevronRight size={13} style={{ flexShrink: 0, opacity: 0.4 }} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Message thread ──────────────────────────────────────── */}
        {hasMessages && (
          <div style={{ paddingBottom: 8 }}>
            {/* Error banner */}
            {error && (
              <div
                style={{
                  background: '#fef0ee',
                  border: '1px solid #f5c6c0',
                  borderRadius: 12,
                  padding: '10px 12px',
                  marginBottom: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <AlertCircle size={16} style={{ color: '#c0392b', flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: 12, color: '#c0392b', lineHeight: 1.4 }}>
                  {error}
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <MessageBubble
                key={i}
                role={msg.role}
                text={msg.text}
                reply={msg.reply}
                details={msg.details}
                table={msg.table}
              />
            ))}

            {/* Typing indicator */}
            {typing && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div
                  style={{
                    width: 28, height: 28, borderRadius: 10, flexShrink: 0,
                    background: 'linear-gradient(135deg,#0F6A4B,#1a8a60)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Bot size={14} color="white" />
                </div>
                <div
                  style={{
                    background: '#f5f2eb', borderRadius: '4px 16px 16px 16px',
                    padding: '10px 14px', display: 'flex', gap: 4, alignItems: 'center',
                  }}
                >
                  {[0, 1, 2].map(i => (
                    <span
                      key={i}
                      style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: '#0F6A4B',
                        display: 'inline-block',
                        animation: `aiBounce 1s ${i * 0.18}s ease-in-out infinite`,
                        opacity: 0.7,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty placeholder when messages exist but before first reply */}
        {!hasMessages && (
          <div
            style={{
              textAlign: 'center', padding: '20px 0 8px',
              color: '#ccc', fontSize: 12,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            }}
          >
            <MessageSquare size={28} style={{ opacity: 0.25 }} />
            <p style={{ margin: 0 }}>Ask anything or pick a suggestion above</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input bar ───────────────────────────────────────────── */}
      <div
        style={{
          padding: '12px 16px 16px',
          borderTop: '1px solid #ede9e0',
          flexShrink: 0,
          background: '#fff',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#f5f2eb',
            border: '1.5px solid #e5e0d6',
            borderRadius: 14,
            padding: '8px 8px 8px 14px',
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
          onFocusCapture={e => {
            e.currentTarget.style.borderColor = '#0F6A4B';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(15,106,75,0.10)';
            e.currentTarget.style.background = '#fff';
          }}
          onBlurCapture={e => {
            e.currentTarget.style.borderColor = '#e5e0d6';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.background = '#f5f2eb';
          }}
        >
          {/* Sparkles icon inside input */}
          <Sparkles size={14} style={{ color: '#0F6A4B', flexShrink: 0, opacity: 0.7 }} />

          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask FinEdge AI…"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: 13,
              color: '#1c1c1e',
              fontFamily: 'inherit',
              minWidth: 0,
            }}
          />

          {/* Send button */}
          <button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            style={{
              width: 30, height: 30, borderRadius: 9, flexShrink: 0,
              background: input.trim() ? '#0F6A4B' : '#e5e0d6',
              color: input.trim() ? '#fff' : '#aaa',
              border: 'none',
              cursor: input.trim() ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s',
              padding: 0, boxShadow: input.trim() ? '0 2px 6px rgba(15,106,75,0.3)' : 'none',
            }}
            aria-label="Send message"
          >
            <Send size={13} />
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: 10, color: '#ccc', margin: '8px 0 0' }}>
          Powered by Groq AI · FinEdge ERP Assistant
        </p>
      </div>

      {/* Keyframe for typing dots */}
      <style>{`
        @keyframes aiBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </motion.div>
  );
}
