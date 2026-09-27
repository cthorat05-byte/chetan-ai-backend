const express = require('express');
const router = express.Router();
const db = require('../db/db');
const sheets = require('../services/googleSheetsService');

// GET /api/sales
router.get('/', (req, res) => {
  res.json(db.prepare(`SELECT * FROM sales ORDER BY id DESC LIMIT 100`).all());
});

// POST /api/sales  { date, so, distributor, market, hq, tc, pc, products: {...} }
router.post('/', async (req, res) => {
  const { date, so, distributor, market, hq, tc, pc, products } = req.body;
  const total = Object.values(products || {}).reduce((a, c) => a + Number(c || 0), 0);
  db.prepare(
    `INSERT INTO sales (date, so, distributor, market, hq, tc, pc, products_json, total_boxes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(date, so, distributor, market, hq, tc, pc, JSON.stringify(products || {}), total);

  let sheetsStatus = 'skipped';
  if (sheets.isConnected()) {
    try {
      await sheets.addSale({ date, so, distributor, market, hq, tc, pc, products, total });
      sheetsStatus = 'synced';
    } catch (e) {
      sheetsStatus = 'failed: ' + e.message;
    }
  } else {
    sheetsStatus = 'NOT_CONNECTED';
  }
  res.json({ ok: true, total, sheetsStatus });
});

module.exports = router;
