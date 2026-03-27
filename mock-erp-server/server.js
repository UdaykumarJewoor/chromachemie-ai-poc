require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Multer for PDF uploads (store in memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'), false);
  }
});

// Import routes
const poRoutes = require('./routes/purchaseOrders');
const productRoutes = require('./routes/products');
const customerRoutes = require('./routes/customers');
const ocrRoutes = require('./routes/ocr');
const statsRoutes = require('./routes/stats');

// Register routes
app.use('/api/po', poRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/ocr', ocrRoutes);
app.use('/api/stats', statsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    mode: 'AI-POC',
    version: '2.0',
    timestamp: new Date().toISOString(),
    aiEnabled: !!process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini'
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Chromachemie AI PO Validation Server`);
  console.log(`   Running at: http://localhost:${PORT}`);
  console.log(`   AI Mode:    ${process.env.OPENAI_API_KEY ? '✅ ENABLED (OpenAI)' : '❌ DISABLED (set OPENAI_API_KEY in .env)'}`);
  console.log(`   Model:      ${process.env.OPENAI_MODEL || 'gpt-4o-mini'}\n`);
});

module.exports = app;
