import 'dotenv/config';

export const config = {
  discord: {
    token: process.env.DISCORD_TOKEN,
    prefix: process.env.PREFIX || 'ai',
    adminRoleIds: (process.env.ADMIN_ROLE_IDS || '')
      .split(',')
      .map(r => r.trim())
      .filter(Boolean),
    logChannelId: process.env.LOG_CHANNEL_ID || null,
  },
  groq: {
    apiKey: process.env.GROQ_API_KEY,
    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  },
  security: {
    logChannelId: process.env.SECURITY_LOG_CHANNEL_ID || process.env.LOG_CHANNEL_ID || null,
  },
  mongodb: {
    uri: process.env.MONGODB_URI || null,
  },
};

export function validateConfig() {
  const missing = [];
  if (!config.discord.token) missing.push('DISCORD_TOKEN');
  if (!config.groq.apiKey) missing.push('GROQ_API_KEY');
  return missing;
}
