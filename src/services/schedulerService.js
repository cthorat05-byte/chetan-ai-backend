// Scheduler service — checks scheduled_messages every minute and sends due ones via whatsappService
const cron = require('node-cron');
const db = require('../db/db');
const whatsapp = require('./whatsappService');

function start() {
  cron.schedule('* * * * *', async () => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toTimeString().slice(0, 5);

    const due = db.prepare(
      `SELECT * FROM scheduled_messages WHERE status = 'Pending' AND send_date = ? AND send_time <= ?`
    ).all(dateStr, timeStr);

    for (const item of due) {
      try {
        if (whatsapp.isConnected()) {
          await whatsapp.sendMessage(item.phone, item.message);
          db.prepare(`UPDATE scheduled_messages SET status = 'Completed' WHERE id = ?`).run(item.id);
        } else {
          // No API connected — leave as Pending, don't fake success.
          console.log(`[scheduler] WhatsApp not connected, skipping send for #${item.id}`);
        }
      } catch (e) {
        db.prepare(`UPDATE scheduled_messages SET status = 'Failed' WHERE id = ?`).run(item.id);
        console.error(`[scheduler] send failed for #${item.id}:`, e.message);
      }
    }
  });
  console.log('[scheduler] cron started (checks every minute)');
}

module.exports = { start };
