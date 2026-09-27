const express = require('express');
const router = express.Router();
const whatsapp = require('../services/whatsappService');
const db = require('../db/db');

// GET /api/whatsapp/status
router.get('/status', (req, res) => res.json({ connected: whatsapp.isConnected() }));

// POST /api/whatsapp/link  { phone, message }
router.post('/link', (req, res) => {
  const { phone, message } = req.body;
  res.json({ link: whatsapp.generateLink(phone, message) });
});

// POST /api/whatsapp/send  { contact, phone, message }
router.post('/send', async (req, res) => {
  const { contact, phone, message } = req.body;
  try {
    const result = await whatsapp.sendMessage(phone, message);
    db.prepare(`INSERT INTO messages (contact, phone, message, status) VALUES (?, ?, ?, 'sent')`).run(contact, phone, message);
    res.json({ ok: true, result });
  } catch (e) {
    db.prepare(`INSERT INTO messages (contact, phone, message, status) VALUES (?, ?, ?, 'failed')`).run(contact, phone, message);
    res.status(e.code === 'NOT_CONNECTED' ? 503 : 500).json({ error: e.message });
  }
});

module.exports = router;
