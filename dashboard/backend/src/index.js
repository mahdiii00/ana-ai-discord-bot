import express from 'express';
import cors from 'cors';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { config } from './config.js';
import { connectDB } from './db.js';
import authRoutes from './routes/auth.js';
import guildRoutes from './routes/guilds.js';
import configRoutes from './routes/config.js';
import ticketRoutes from './routes/tickets.js';
import logRoutes from './routes/logs.js';
import backupRoutes from './routes/backups.js';
import analyticsRoutes from './routes/analytics.js';

const app = express();

app.use(cors({
  origin: config.frontend.url,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: config.session.secret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
}));

app.use('/api/auth', authRoutes);
app.use('/api/guilds', guildRoutes);
app.use('/api/config', configRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/backups', backupRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

await connectDB();
app.listen(config.port, () => {
  console.log(`[API] Server running on http://localhost:${config.port}`);
});
