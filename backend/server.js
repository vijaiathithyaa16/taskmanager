require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRouter = require('./routes/auth');
const tasksRouter = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET is not set. Set it in your .env before deploying.');
}

const allowedOrigins = (process.env.CORS_ORIGIN || '*')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: allowedOrigins.includes('*') ? true : allowedOrigins
  })
);
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRouter);
app.use('/api/tasks', tasksRouter);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

app.listen(PORT, () => {
  console.log(`Task manager API running on port ${PORT}`);
});
