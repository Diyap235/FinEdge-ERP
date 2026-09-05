import express from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import { normalizeRole, PERMISSION_DENIED } from '../ai/permissions.js';
import { ocrService } from '../services/ocr.service.js';
import { invoiceCreatorService } from '../services/invoiceCreator.service.js';

const router = express.Router();

// Role-based access control middleware for OCR automation: Admin and Accountant only
export function requireOcrRole(req, res, next) {
  const role = normalizeRole(req.user?.role);
  if (role !== 'admin' && role !== 'accountant') {
    return res.status(403).json({
      success: false,
      error: PERMISSION_DENIED,
    });
  }
  return next();
}

// In-memory Multer configuration (max 10MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMime = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ];
    const allowedExt = /\.(pdf|jpe?g|png|webp)$/i;

    if (
      allowedMime.includes(file.mimetype) ||
      allowedExt.test(file.originalname)
    ) {
      return cb(null, true);
    }
    return cb(
      new Error(
        'Unsupported file format. Please upload a PDF, JPG, or PNG document.'
      ),
      false
    );
  },
});

/**
 * POST /api/ocr/process
 * Uploads an invoice document, performs OCR/text extraction, and structures data with Groq.
 */
router.post(
  '/process',
  requireAuth,
  requireOcrRole,
  (req, res, next) => {
    upload.single('invoice')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            error: 'File is too large. Maximum allowed size is 10MB.',
          });
        }
        return res.status(400).json({ success: false, error: err.message });
      } else if (err) {
        return res.status(400).json({ success: false, error: err.message });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No invoice file uploaded. Please select a PDF or image file.',
        });
      }

      // 1. OCR / Document text extraction
      const extractedText = await ocrService.extractTextFromFile(
        req.file.buffer,
        req.file.mimetype,
        req.file.originalname
      );

      // 2. Groq AI invoice structuring
      const structuredData = await ocrService.analyzeInvoiceWithGroq(
        extractedText
      );

      // 3. Match existing ERP entities (Contacts & Products)
      const matchedData = await ocrService.matchErpEntities(structuredData);

      // 4. Validate arithmetic and required fields
      const validation = ocrService.validateInvoiceData(matchedData);

      return res.json({
        success: true,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        data: matchedData,
        validation,
      });
    } catch (error) {
      console.error('[OCR-PROCESS-ERROR]', error);
      return res.status(500).json({
        success: false,
        error:
          error.message ||
          'Failed to process the invoice document. Please try again.',
      });
    }
  }
);

/**
 * POST /api/ocr/confirm
 * Creates the reviewed Customer Invoice or Vendor Bill in FinEdge-ERP
 */
router.post('/confirm', requireAuth, requireOcrRole, async (req, res) => {
  try {
    const payload = req.body;

    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Invalid invoice creation payload.',
      });
    }

    const created = await invoiceCreatorService.confirmAndCreateInvoice(
      payload,
      req.user
    );

    return res.status(201).json({
      success: true,
      message: `${
        created.invoiceType === 'vendor_bill'
          ? 'Vendor Bill'
          : 'Customer Invoice'
      } created successfully!`,
      invoice: created,
    });
  } catch (error) {
    console.error('[OCR-CONFIRM-ERROR]', error);
    return res.status(400).json({
      success: false,
      error:
        error.message ||
        'Failed to create invoice in ERP. Please review values and try again.',
    });
  }
});

export default router;
