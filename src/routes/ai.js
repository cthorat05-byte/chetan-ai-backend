const express = require('express');
const router = express.Router();
const ai = require('../services/aiService');
const db = require('../db/db');

// POST /api/ai/intent  { text }
router.post('/intent', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'text is required' });
  const today = new Date().toISOString().slice(0, 10);
  try {
    const result = await ai.detectIntent(text, today);
    db.prepare(`INSERT INTO workflow_runs (input_text, intent, action_json, status) VALUES (?, ?, ?, ?)`)
      .run(text, result.intent, JSON.stringify(result), 'success');
    res.json(result);
  } catch (e) {
    db.prepare(`INSERT INTO workflow_runs (input_text, intent, action_json, status) VALUES (?, ?, ?, ?)`)
      .run(text, 'ERROR', JSON.stringify({ error: e.message }), 'failed');
    res.status(e.code === 'NOT_CONNECTED' ? 503 : 500).json({ error: e.message });
  }
});

module.exports = router;
