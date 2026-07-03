export function extractUserId(text) {
  if (!text) return null;
  const mention = text.match(/^<@!?(\d+)>$/);
  if (mention) return mention[1];
  const id = text.match(/\b(\d{17,20})\b/);
  if (id) return id[1];
  return null;
}

export function parseDuration(durationStr) {
  if (!durationStr) return null;
  const match = durationStr.match(/^(\d+)\s*(s|m|h|d|seconds?|minutes?|hours?|days?)$/i);
  if (!match) return null;
  const value = parseInt(match[1]);
  const unit = match[2].toLowerCase()[0];
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return value * (multipliers[unit] || 60000);
}

export function parseMessageCount(str) {
  if (!str) return null;
  const match = str.match(/\b(\d+)\b/);
  if (match) {
    const n = parseInt(match[1]);
    if (n >= 1 && n <= 100) return n;
  }
  return null;
}

export function permissionLabel(permission) {
  const labels = {
    KickMembers: 'Kick Members',
    BanMembers: 'Ban Members',
    ManageChannels: 'Manage Channels',
    ManageRoles: 'Manage Roles',
    ManageMessages: 'Manage Messages',
    ManageGuild: 'Manage Server',
    ModerateMembers: 'Moderate Members',
    ManageEmojisAndStickers: 'Manage Emojis & Stickers',
    Administrator: 'Administrator',
  };
  return labels[permission] || permission;
}
