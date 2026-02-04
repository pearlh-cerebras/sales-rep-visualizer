import express from 'express';
import cors from 'cors';
import gmailRoutes from './routes/gmail.js';
import slackRoutes from './routes/slack.js';
import crmRoutes from './routes/crm.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
}));
app.use(express.json());

app.use('/api/gmail', gmailRoutes);
app.use('/api/slack', slackRoutes);
app.use('/api/crm', crmRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});