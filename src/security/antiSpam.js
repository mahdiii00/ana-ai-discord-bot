import { getGuildConfig } from '../store/guildConfig.js';
import { logSecurityAction } from '../services/loggingService.js';

const userMessageCounts = new Map();

setInterval(() => {
  const cutoff = Date.now() - 60000;
  for (const [key, timestamps] of userMessageCounts) {
    const filtered = timestamps.filter(t => t > cutoff);
    if (filtered.length === 0) userMessageCounts.delete(key);
    else userMessageCounts.set(key, filtered);
  }
}, 120000);

export async function checkSpam(message) {
  const cfg = getGuildConfig(message.guild.id);
  if (!cfg.antiSpam.enabled) return { blocked: false };

  const now = Date.now();
  const userId = message.author.id;
  const key = `${message.guild.id}:${userId}`;

  if (!userMessageCounts.has(key)) userMessageCounts.set(key, []);
  const timestamps = userMessageCounts.get(key);
  timestamps.push(now);

  const windowStart = now - cfg.antiSpam.windowSec * 1000;
  const recent = timestamps.filter(t => t > windowStart);
  userMessageCounts.set(key, recent);

  if (recent.length >= cfg.antiSpam.threshold) {
    await logSecurityAction(message.guild, 'SPAM_DETECTED', {
      user: message.author.tag,
      count: recent.length,
      window: `${cfg.antiSpam.windowSec}s`,
    });

    try {
      await message.member.timeout(60_000, 'Spam detected');
    } catch (e) {
      console.error(`[AntiSpam] Timeout failed for ${userId}:`, e.message);
    }

    return { blocked: true, reason: 'Spam detected. Timed out for 60s.' };
  }

  return { blocked: false };
}
