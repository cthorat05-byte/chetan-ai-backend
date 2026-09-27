# Chetan AI Assistant — Backend

Real backend for the Chetan AI Assistant demo: Express API + SQLite database,
with WhatsApp, Google Sheets, and Claude AI integrations that activate as soon
as you add credentials — no fake/simulated success anywhere.

## 1. Install

```bash
npm install
cp .env.example .env
```

## 2. Run locally

```bash
npm start
# server runs on http://localhost:4000
```

Until you fill in `.env`, every integration route responds with a clear
`NOT_CONNECTED` error instead of pretending to work — check each one's status:

```bash
curl http://localhost:4000/api/whatsapp/status
curl http://localhost:4000/api/google-sheets/status
```

## 3. Connect WhatsApp (Meta Cloud API)

1. Go to https://developers.facebook.com/apps → create an app → add "WhatsApp" product.
2. In WhatsApp > API Setup, copy your **Phone Number ID** and a temporary **Access Token**
   (generate a permanent token later via a System User for production).
3. Put them in `.env`:
   ```
   WHATSAPP_PHONE_NUMBER_ID=...
   WHATSAPP_ACCESS_TOKEN=...
   ```
4. Test: `POST /api/whatsapp/send { "phone": "91XXXXXXXXXX", "message": "Test" }`

Alternative if you don't want Meta's approval process: use Twilio's WhatsApp
API instead — same idea, swap the fetch call in `src/services/whatsappService.js`
for Twilio's SDK.

## 4. Connect Google Sheets

1. https://console.cloud.google.com → new project → enable **Google Sheets API**.
2. IAM & Admin > Service Accounts → create one → generate a JSON key.
3. Open your Google Sheet, click Share, and share it with the service account's
   email (looks like `xxx@yyy.iam.gserviceaccount.com`) as **Editor**.
4. In `.env`, set `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY` (keep the `\n`s
   in the key, they get unescaped automatically), and `GOOGLE_SHEET_ID` (from
   the sheet's URL).
5. Create a tab named `Sales` in that sheet with a header row.

## 5. Connect the AI (Claude)

1. Get a key at https://console.anthropic.com.
2. Set `ANTHROPIC_API_KEY` in `.env`.
3. `src/services/aiService.js` sends every chat message to Claude with a system
   prompt that returns structured intent JSON — swap in your own prompt or
   model as needed.

## 6. Deploy

- **Railway / Render**: connect this repo, set the same env vars in their
  dashboard, done — both support long-running Node processes (needed for
  `node-cron` scheduler).
- **Vercel**: works for the API routes but not for the cron scheduler
  (serverless functions don't stay running); use Vercel Cron Jobs or move
  the scheduler to Railway/Render instead.
- Swap `better-sqlite3` for Postgres (e.g. Supabase) once you need multiple
  server instances — SQLite is fine for a single-instance deploy.

## API routes

| Route | Method | Purpose |
|---|---|---|
| `/api/ai/intent` | POST | Real Claude-based intent detection |
| `/api/whatsapp/link` | POST | Generate a wa.me link (no credentials needed) |
| `/api/whatsapp/send` | POST | Send a real WhatsApp message |
| `/api/scheduler` | GET/POST | List / create scheduled messages |
| `/api/sales` | GET/POST | List / log a sales entry (auto-syncs to Sheets if connected) |
| `/api/reminders` | GET/POST/PATCH | List / create / update reminders |
| `/api/google-sheets/*` | GET | Sales data & summaries pulled live from your Sheet |

## Next steps

- Wire the demo frontend's fetch calls to these routes instead of localStorage.
- Add auth (even a simple shared-secret header) before deploying publicly.
- Move scheduler sends from cron-polling to a queue (BullMQ) if volume grows.
