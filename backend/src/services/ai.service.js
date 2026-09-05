import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const aiService = {
  /**
   * Chat with AI assistant about ERP data and operations
   * @param {string} message - User's message
   * @param {Array} conversation - Previous conversation history
   * @returns {Promise<string>} - AI response
   */
  async chat(message, conversation = []) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not configured');
    }

    // System prompt to guide the AI assistant
    const systemPrompt = `You are Urbie, an intelligent AI assistant for FinEdge-ERP, a furniture business ERP system.

You help users with:
- Understanding financial reports (Profit & Loss, Balance Sheet)
- Explaining accounting entries and journal items
- Providing insights on sales orders, purchase orders, and invoices
- Answering questions about customers, vendors, and products
- Explaining accounting concepts (debits, credits, double-entry bookkeeping)
- Helping navigate the ERP system

Key accounting principles:
- Assets and Expenses increase with Debit, decrease with Credit
- Liabilities, Capital, and Income increase with Credit, decrease with Debit
- Every transaction must balance: Total Debits = Total Credits

Be concise, friendly, and helpful. If you don't have specific data, provide general guidance.
Format numbers with ₹ for Indian Rupees when discussing money.`;

    // Build messages array for Groq API
    const messages = [
      {
        role: 'system',
        content: systemPrompt,
      },
    ];

    // Add conversation history
    for (const msg of conversation) {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    }

    // Add current message
    messages.push({
      role: 'user',
      content: message,
    });

    try {
      // Call Groq API
      // Using Llama 3.1 70B - stable and widely available model
      // Note: llama-3.3-70b is being deprecated, llama-3.1-70b-versatile is current
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 1,
        stream: false,
      });

      const reply = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response. Please try again.';

      return reply;
    } catch (error) {
      console.error('Groq API error details:', {
        message: error.message,
        status: error.status,
        statusText: error.statusText,
        code: error.code,
        type: error.type,
      });
      
      if (error.status === 401 || error.message?.includes('API key')) {
        throw new Error('Invalid GROQ_API_KEY. Please check your configuration at https://console.groq.com/keys');
      }
      
      if (error.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      }
      
      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        throw new Error('Cannot connect to Groq API. Please check your internet connection.');
      }
      
      if (error.message?.includes('model') || error.status === 404) {
        throw new Error('Model not found. The Groq model may be unavailable. Please try again later.');
      }

      throw new Error(`Failed to get AI response: ${error.message}`);
    }
  },
};

export default aiService;
