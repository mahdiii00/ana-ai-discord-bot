import { getGuildConfig, updateGuildConfig } from '../store/guildConfig.js';

export function isWhitelisted(guildId, userId) {
  const cfg = getGuildConfig(guildId);
  return cfg.whitelist.includes(userId);
}

export function isBlacklisted(guildId, userId) {
  const cfg = getGuildConfig(guildId);
  return cfg.blacklist.includes(userId);
}

export function addWhitelist(guildId, userId) {
  const cfg = getGuildConfig(guildId);
  if (!cfg.whitelist.includes(userId)) {
    cfg.whitelist.push(userId);
  }
  return cfg.whitelist;
}

export function removeWhitelist(guildId, userId) {
  const cfg = getGuildConfig(guildId);
  cfg.whitelist = cfg.whitelist.filter(id => id !== userId);
  return cfg.whitelist;
}

export function addBlacklist(guildId, userId) {
  const cfg = getGuildConfig(guildId);
  if (!cfg.blacklist.includes(userId)) {
    cfg.blacklist.push(userId);
  }
  return cfg.blacklist;
}

export function removeBlacklist(guildId, userId) {
  const cfg = getGuildConfig(guildId);
  cfg.blacklist = cfg.blacklist.filter(id => id !== userId);
  return cfg.blacklist;
}
