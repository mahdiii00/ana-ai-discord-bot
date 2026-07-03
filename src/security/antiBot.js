import { getGuildConfig } from '../store/guildConfig.js';
import { logSecurityAction } from '../services/loggingService.js';

export async function checkBotJoin(member) {
  if (!member.user.bot) return { blocked: false };

  const cfg = getGuildConfig(member.guild.id);
  if (!cfg.antiBot.enabled) return { blocked: false };

  if (cfg.allowedBotIds.includes(member.user.id)) {
    return { blocked: false };
  }

  await logSecurityAction(member.guild, 'BOT_JOINED', {
    bot: member.user.tag,
    id: member.user.id,
  });

  try {
    await member.kick('Unauthorized bot. Use /security allow-bot to authorize.');
  } catch {}

  return { blocked: true, reason: `Kicked unauthorized bot: ${member.user.tag}` };
}
