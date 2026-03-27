const express = require('express');
const router = express.Router();
const db = require('../services/database');

router.get('/', (req, res) => res.json(db.getProducts()));
router.get('/cas/:casNumber', (req, res) => {
  const p = db.getProductByCAS(req.params.casNumber);
  if (!p) return res.status(404).json({ error: 'Product not found for CAS: ' + req.params.casNumber });
  res.json(p);
});
router.get('/:id', (req, res) => {
  const p = db.getProductById(req.params.id);
  if (!p) return res.status(404).json({ error: 'Product not found' });
  res.json(p);
});
router.post('/', (req, res) => res.status(201).json(db.addProduct(req.body)));
router.put('/:id', (req, res) => {
  const p = db.updateProduct(req.params.id, req.body);
  if (!p) return res.status(404).json({ error: 'Product not found' });
  res.json(p);
});
router.delete('/:id', (req, res) => {
  if (!db.deleteProduct(req.params.id)) return res.status(404).json({ error: 'Product not found' });
  res.json({ success: true });
});

module.exports = router;
