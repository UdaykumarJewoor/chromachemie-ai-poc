const express = require('express');
const router = express.Router();
const db = require('../services/database');

router.get('/', (req, res) => res.json(db.getCustomers()));
router.get('/:id', (req, res) => {
  const c = db.getCustomerById(req.params.id);
  if (!c) return res.status(404).json({ error: 'Customer not found' });
  res.json(c);
});
router.post('/', (req, res) => res.status(201).json(db.addCustomer(req.body)));
router.put('/:id', (req, res) => {
  const c = db.updateCustomer(req.params.id, req.body);
  if (!c) return res.status(404).json({ error: 'Customer not found' });
  res.json(c);
});
router.delete('/:id', (req, res) => {
  if (!db.deleteCustomer(req.params.id)) return res.status(404).json({ error: 'Customer not found' });
  res.json({ success: true });
});

module.exports = router;
