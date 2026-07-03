const configs = new Map();

const DEFAULTS = {
  antiNuke: { enabled: true, threshold: 5, windowSec: 10 },
  antiRaid: { enabled: true, threshold: 10, windowSec: 15 },
  antiSpam: { enabled: true, threshold: 5, windowSec: 5 },
  antiLink: { enabled: true },
  antiBot: { enabled: true },
  antiScam: { enabled: true },
  autoMod: { enabled: true },
  panicMode: false,
  logChannelId: null,
  joinLogs: true,
  leaveLogs: true,
  messageLogs: true,
  roleLogs: true,
  channelLogs: true,
  voiceLogs: true,
  auditLogs: true,
  allowedBotIds: [],
  linkAllowlist: [],
  mutedRoleId: null,
  whitelist: [],
  blacklist: [],
  dailyBackup: true,
  autoBackup: true,
};

export function getGuildConfig(guildId) {
  if (!configs.has(guildId)) {
    configs.set(guildId, JSON.parse(JSON.stringify(DEFAULTS)));
  }
  return configs.get(guildId);
}

export function updateGuildConfig(guildId, updates) {
  const cfg = getGuildConfig(guildId);
  Object.assign(cfg, updates);
  return cfg;
}
