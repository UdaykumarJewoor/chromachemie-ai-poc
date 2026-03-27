/**
 * OCR Route
 * Accepts PDF uploads → extracts text → AI extracts PO fields → AI validates
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { v4: uuidv4 } = require('uuid');

const db = require('../services/database');
const agent = require('../ai-agents/poValidationAgent');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'), false);
  }
});

/**
 * POST /api/ocr/upload
 * Upload a PO PDF → AI extracts and validates
 */
router.post('/upload', upload.single('poFile'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No PDF file uploaded. Use field name: poFile' });
  }

  const startTime = Date.now();
  const poId = 'PO-AI-' + uuidv4().slice(0, 8).toUpperCase();

  try {
    // Step 1: Extract text from PDF
    let rawText;
    try {
      const pdfData = await pdfParse(req.file.buffer);
      rawText = pdfData.text;
      if (!rawText || rawText.trim().length < 20) {
        return res.status(422).json({
          error: 'PDF appears to be scanned/image-only. Text extraction returned empty. Use a text-based PDF.'
        });
      }
    } catch (pdfErr) {
      return res.status(422).json({ error: 'Failed to parse PDF: ' + pdfErr.message });
    }

    // Step 2: AI extracts structured PO fields from raw text
    let extracted;
    try {
      extracted = await agent.extractPOFromText(rawText);
    } catch (aiErr) {
      return res.status(500).json({
        error: 'AI extraction failed: ' + aiErr.message,
        hint: 'Check your OPENAI_API_KEY in .env'
      });
    }

    // Step 3: AI validates extracted PO against master data
    const masterData = db.getMasterDataForAI();
    let validation;
    try {
      validation = await agent.validatePO(extracted, masterData);
    } catch (aiErr) {
      return res.status(500).json({ error: 'AI validation failed: ' + aiErr.message });
    }

    const processingTime = Date.now() - startTime;

    // Step 4: Store in log
    const poRecord = {
      id: poId,
      filename: req.file.originalname,
      fileSize: req.file.size,
      rawTextLength: rawText.length,
      extractedData: extracted,
      validationResult: validation,
      processingTimeMs: processingTime,
      processedAt: new Date().toISOString(),
      status: validation.overallStatus
    };
    db.addPOToLog(poRecord);

    res.json({
      success: true,
      poId,
      processingTimeMs: processingTime,
      filename: req.file.originalname,
      extractedData: extracted,
      validation,
      rawTextPreview: rawText.substring(0, 500) + (rawText.length > 500 ? '...' : '')
    });

  } catch (err) {
    console.error('OCR/Validation error:', err);
    res.status(500).json({ error: 'Internal server error: ' + err.message });
  }
});

/**
 * POST /api/ocr/validate-json
 * Validate a JSON PO (no PDF needed) - useful for testing
 */
router.post('/validate-json', async (req, res) => {
  const poData = req.body;
  if (!poData || Object.keys(poData).length === 0) {
    return res.status(400).json({ error: 'No PO data provided in request body' });
  }

  const startTime = Date.now();
  const poId = 'PO-JSON-' + uuidv4().slice(0, 8).toUpperCase();

  try {
    const masterData = db.getMasterDataForAI();
    const validation = await agent.validatePO(poData, masterData);
    const processingTime = Date.now() - startTime;

    const poRecord = {
      id: poId,
      source: 'json-api',
      extractedData: poData,
      validationResult: validation,
      processingTimeMs: processingTime,
      processedAt: new Date().toISOString(),
      status: validation.overallStatus
    };
    db.addPOToLog(poRecord);

    res.json({ success: true, poId, processingTimeMs: processingTime, validation });
  } catch (err) {
    console.error('JSON validation error:', err);
    res.status(500).json({ error: err.message, hint: 'Check your OPENAI_API_KEY in .env' });
  }
});

module.exports = router;
