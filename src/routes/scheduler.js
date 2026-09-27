const express = require('express');
const router = express.Router();
const db = require('../db/db');

// GET /api/scheduler
router.get('/', (req, res) => {
  res.json(db.prepare(`SELECT * FROM scheduled_messages ORDER BY id DESC`).all());
});

// POST /api/scheduler  { recipient, phone, message, date, time }
router.post('/', (req, res) => {
  const { recipient, phone, message, date, time } = req.body;
  const info = db.prepare(
    `INSERT INTO scheduled_messages (recipient, phone, message, send_date, send_time) VALUES (?, ?, ?, ?, ?)`
  ).run(recipient, phone, message, date, time);
  res.json({ id: info.lastInsertRowid });
});

module.exports = router;
