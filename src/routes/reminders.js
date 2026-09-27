const express = require('express');
const router = express.Router();
const db = require('../db/db');

// GET /api/reminders
router.get('/', (req, res) => {
  res.json(db.prepare(`SELECT * FROM reminders ORDER BY id DESC`).all());
});

// POST /api/reminders  { task, date, time }
router.post('/', (req, res) => {
  const { task, date, time } = req.body;
  const info = db.prepare(`INSERT INTO reminders (task, date, time) VALUES (?, ?, ?)`).run(task, date, time);
  res.json({ id: info.lastInsertRowid });
});

// PATCH /api/reminders/:id  { status }
router.patch('/:id', (req, res) => {
  db.prepare(`UPDATE reminders SET status = ? WHERE id = ?`).run(req.body.status, req.params.id);
  res.json({ ok: true });
});

module.exports = router;
