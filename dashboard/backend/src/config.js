import 'dotenv/config';

export const config = {
  port: parseInt(process.env.PORT || '3001'),
  discord: {
    clientId: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    redirectUri: process.env.DISCORD_REDIRECT_URI || 'http://localhost:3001/api/auth/discord/callback',
  },
  session: {
    secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
  },
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ana-dashboard',
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
};
