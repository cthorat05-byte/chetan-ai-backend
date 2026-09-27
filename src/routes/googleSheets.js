const express = require('express');
const router = express.Router();
const sheets = require('../services/googleSheetsService');

router.get('/status', (req, res) => res.json({ connected: sheets.isConnected() }));

router.get('/sales', async (req, res) => {
  try { res.json(await sheets.getSales()); }
  catch (e) { res.status(e.code === 'NOT_CONNECTED' ? 503 : 500).json({ error: e.message }); }
});

router.get('/summary/products', async (req, res) => {
  try { res.json(await sheets.getProductSummary()); }
  catch (e) { res.status(e.code === 'NOT_CONNECTED' ? 503 : 500).json({ error: e.message }); }
});

router.get('/summary/distributors', async (req, res) => {
  try { res.json(await sheets.getDistributorSummary()); }
  catch (e) { res.status(e.code === 'NOT_CONNECTED' ? 503 : 500).json({ error: e.message }); }
});

module.exports = router;
