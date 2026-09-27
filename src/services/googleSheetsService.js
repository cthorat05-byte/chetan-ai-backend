// Google Sheets service — logs sales into a real spreadsheet
// Setup:
// 1. Google Cloud Console > new project > enable "Google Sheets API"
// 2. Create a Service Account, generate a JSON key
// 3. Share your target Google Sheet with the service account's email (as Editor)
// 4. Put GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEET_ID in .env
require('dotenv').config();
const { google } = require('googleapis');

function isConnected() {
  return Boolean(process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY && process.env.GOOGLE_SHEET_ID);
}

function getClient() {
  const auth = new google.auth.JWT(
    process.env.GOOGLE_CLIENT_EMAIL,
    null,
    (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    ['https://www.googleapis.com/auth/spreadsheets']
  );
  return google.sheets({ version: 'v4', auth });
}

async function addSale(sale) {
  if (!isConnected()) {
    const err = new Error('Google Sheets: NOT CONNECTED. Add GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEET_ID in .env');
    err.code = 'NOT_CONNECTED';
    throw err;
  }
  const sheets = getClient();
  const row = [sale.date, sale.so, sale.distributor, sale.market, sale.hq, sale.tc, sale.pc, JSON.stringify(sale.products), sale.total];
  return sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: 'Sales!A:I',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [row] }
  });
}

async function getSales() {
  if (!isConnected()) throw Object.assign(new Error('Google Sheets: NOT CONNECTED'), { code: 'NOT_CONNECTED' });
  const sheets = getClient();
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: process.env.GOOGLE_SHEET_ID, range: 'Sales!A:I' });
  return res.data.values || [];
}

async function getMonthlySales(month) {
  const all = await getSales();
  return all.filter(row => (row[0] || '').startsWith(month));
}

async function getProductSummary() {
  const all = await getSales();
  const summary = {};
  all.forEach(row => {
    try {
      const products = JSON.parse(row[7] || '{}');
      Object.entries(products).forEach(([p, qty]) => { summary[p] = (summary[p] || 0) + Number(qty || 0); });
    } catch (e) { /* skip malformed row */ }
  });
  return summary;
}

async function getDistributorSummary() {
  const all = await getSales();
  const summary = {};
  all.forEach(row => { const d = row[2]; summary[d] = (summary[d] || 0) + Number(row[8] || 0); });
  return summary;
}

module.exports = { isConnected, addSale, getSales, getMonthlySales, getProductSummary, getDistributorSummary };
