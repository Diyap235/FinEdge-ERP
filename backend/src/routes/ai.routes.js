import express from 'express';
import { aiService } from '../services/ai.service.js';
import { requireAuth } from '../middleware/auth.js';
import { PermissionError } from '../ai/erpTools.js';
import { PERMISSION_DENIED } from '../ai/permissions.js';

const router = express.Router();

/**
 * POST /api/ai/chat
 * Protected by existing User identity (X-User-Id → User.id, role from DB).
 */
router.post('/chat', requireAuth, async (req, res) => {
  try {
    const { message, conversation } = req.body;

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

    if (conversation && !Array.isArray(conversation)) {
      return res.status(400).json({
        success: false,
        error: 'Conversation must be an array',
      });
    }

    const result = await aiService.chat(message, conversation || [], req.user);

    if (typeof result === 'object' && result !== null) {
      return res.json({
        success: true,
        reply: result.reply || '',
        details: Array.isArray(result.details) ? result.details : [],
        table: result.table || null,
      });
    }

    return res.json({
      success: true,
      reply: String(result || ''),
      details: [],
      table: null,
    });
  } catch (error) {
    if (error instanceof PermissionError) {
      return res.status(403).json({
        success: false,
        error: error.message || PERMISSION_DENIED,
      });
    }

    if (error.message?.includes('GROQ_API_KEY')) {
      return res.status(500).json({
        success: false,
        error: 'AI service is not properly configured. Please contact support.',
      });
    }

    if (error.message?.includes('Rate limit') || error.status === 429) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded. Please try again in a moment.',
      });
    }

    console.error('[AI-ERROR]', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process your request. Please try again.',
    });
  }
});

export default router;
