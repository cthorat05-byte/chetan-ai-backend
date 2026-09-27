require('dotenv').config();
const express = require('express');
const cors = require('cors');

const aiRoutes = require('./src/routes/ai');
const whatsappRoutes = require('./src/routes/whatsapp');
const schedulerRoutes = require('./src/routes/scheduler');
const salesRoutes = require('./src/routes/sales');
const remindersRoutes = require('./src/routes/reminders');
const googleSheetsRoutes = require('./src/routes/googleSheets');
const schedulerService = require('./src/services/schedulerService');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json({ status: 'Chetan AI Assistant backend running' }));

app.use('/api/ai', aiRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/scheduler', schedulerRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/reminders', remindersRoutes);
app.use('/api/google-sheets', googleSheetsRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Chetan AI Assistant backend listening on http://localhost:${PORT}`);
  schedulerService.start();
});
