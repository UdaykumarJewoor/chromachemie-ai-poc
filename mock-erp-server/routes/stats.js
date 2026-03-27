const express = require('express');
const router = express.Router();
const db = require('../services/database');

router.get('/', (req, res) => res.json(db.getStats()));

module.exports = router;
