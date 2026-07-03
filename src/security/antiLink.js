import { getGuildConfig } from '../store/guildConfig.js';

const URL_REGEX = /https?:\/\/[^\s]+/gi;
const DISCORD_INVITE_REGEX = /(?:discord\.(?:gg|io|me|plus|com\/invite)\/)[a-zA-Z0-9]+/gi;

export function checkLink(guildId, content, member) {
  const matches = content.match(URL_REGEX);
  if (!matches) return { blocked: false };

  const config = getGuildConfig(guildId);
  const allowlist = config.linkAllowlist || [];

  if (allowlist.length > 0) {
    const allowed = matches.every(url =>
      allowlist.some(allowed =>
        url.toLowerCase().includes(allowed.toLowerCase())
      )
    );
    if (allowed) return { blocked: false, urls: matches };
  }

  if (member) {
    const isAdmin = member.permissions?.has('Administrator');
    const hasManager = member.permissions?.has('ManageGuild');
    if (isAdmin || hasManager) return { blocked: false, urls: matches };
  }

  return { blocked: true, urls: matches };
}
