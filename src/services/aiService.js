// AI service — real intent detection using the Anthropic API (Claude)
// Setup: get a key at https://console.anthropic.com and set ANTHROPIC_API_KEY in .env
require('dotenv').config();

const API_KEY = process.env.ANTHROPIC_API_KEY;

function isConnected() {
  return Boolean(API_KEY);
}

const SYSTEM_PROMPT = `You are the intent router for "Chetan AI Assistant", a sales/automation tool for a
dairy/FMCG distributor sales officer in Maharashtra. The user writes in Marathi, Hindi, English or a mix.
Classify the message into exactly one of these intents:
WHATSAPP, WHATSAPP_SCHEDULE, SALES, SHOP_ORDER, DAILY_REPORT, REMINDER, GOOGLE_SHEETS, EMAIL, SEARCH, GENERAL_CHAT.
Respond with ONLY a JSON object, no other text, no markdown fences:
{"intent": "...", "action": "...", "recipient": "", "phone": "", "message": "", "date": "", "time": "", "requires_confirmation": true}
Dates should be resolved to YYYY-MM-DD (today's date will be provided), times to HH:MM 24-hour format.`;

async function detectIntent(userText, todayISO) {
  if (!isConnected()) {
    const err = new Error('AI Provider: NOT CONNECTED. Set ANTHROPIC_API_KEY in .env');
    err.code = 'NOT_CONNECTED';
    throw err;
  }
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `Today's date: ${todayISO}\nMessage: "${userText}"` }]
    })
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data?.error?.message || 'AI request failed');
    throw err;
  }
  const textBlock = data.content.find(b => b.type === 'text');
  const raw = (textBlock?.text || '{}').replace(/```json|```/g, '').trim();
  try {
    return JSON.parse(raw);
  } catch (e) {
    return { intent: 'GENERAL_CHAT', message: raw, requires_confirmation: false };
  }
}

module.exports = { isConnected, detectIntent };
