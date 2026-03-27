const express = require('express');
const router = express.Router();
const db = require('../services/database');

// GET /api/po/all
router.get('/all', (req, res) => {
  res.json(db.getPOLog());
});

// GET /api/po/pending
router.get('/pending', (req, res) => {
  const pending = db.getPOLog().filter(p =>
    p.validationResult?.overallStatus === 'RED' ||
    p.validationResult?.overallStatus === 'AMBER'
  );
  res.json(pending);
});

// GET /api/po/:id
router.get('/:id', (req, res) => {
  const po = db.getPOById(req.params.id);
  if (!po) return res.status(404).json({ error: 'PO not found' });
  res.json(po);
});

// POST /api/po/:id/approve
router.post('/:id/approve', (req, res) => {
  const po = db.updatePOStatus(req.params.id, 'APPROVED', req.body.notes);
  if (!po) return res.status(404).json({ error: 'PO not found' });
  res.json({ success: true, po });
});

// POST /api/po/:id/reject
router.post('/:id/reject', (req, res) => {
  const po = db.updatePOStatus(req.params.id, 'REJECTED', req.body.reason);
  if (!po) return res.status(404).json({ error: 'PO not found' });
  res.json({ success: true, po });
});

module.exports = router;
