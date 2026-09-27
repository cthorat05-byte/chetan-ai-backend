// WhatsApp service — Meta WhatsApp Business Cloud API
// Setup: https://developers.facebook.com/docs/whatsapp/cloud-api/get-started
require('dotenv').config();

const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

function isConnected() {
  return Boolean(PHONE_NUMBER_ID && ACCESS_TOKEN);
}

// Always safe: generates a wa.me link, works with zero credentials.
function generateLink(phone, message) {
  const cleanPhone = String(phone || '').replace(/\D/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message || '')}`;
}

// Real send — only works once WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN are set.
// Never fakes success: throws if not connected so the caller can show a real error.
async function sendMessage(phone, message) {
  if (!isConnected()) {
    const err = new Error('WhatsApp API: NOT CONNECTED. Set WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN in .env');
    err.code = 'NOT_CONNECTED';
    throw err;
  }
  const cleanPhone = String(phone).replace(/\D/g, '');
  const url = `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: cleanPhone,
      type: 'text',
      text: { body: message }
    })
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data?.error?.message || 'WhatsApp send failed');
    err.details = data;
    throw err;
  }
  return data;
}

module.exports = { isConnected, generateLink, sendMessage };
