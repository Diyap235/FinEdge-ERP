import express from 'express';
import { aiService } from '../services/ai.service.js';

const router = express.Router();

/**
 * POST /api/ai/chat
 * Chat with AI assistant
 * 
 * Request body:
 * {
 *   "message": "User's question",
 *   "conversation": [
 *     { "role": "user", "content": "Previous message" },
 *     { "role": "assistant", "content": "Previous response" }
 *   ]
 * }
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, conversation } = req.body;

    // Validate request
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Message is required and must be a string',
      });
    }

    if (message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message cannot be empty',
      });
    }

    // Validate conversation format if provided
    if (conversation && !Array.isArray(conversation)) {
      return res.status(400).json({
        success: false,
        error: 'Conversation must be an array',
      });
    }

    // Get AI response
    const reply = await aiService.chat(message, conversation || []);

    res.json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error('AI chat error:', error.message);

    // Check for specific error types
    if (error.message.includes('GROQ_API_KEY')) {
      return res.status(500).json({
        success: false,
        error: 'AI service is not properly configured. Please contact support.',
      });
    }

    if (error.message.includes('Rate limit')) {
      return res.status(429).json({
        success: false,
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process your request. Please try again.',
    });
  }
});

export default router;
