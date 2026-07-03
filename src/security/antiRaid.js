import { getGuildConfig } from '../store/guildConfig.js';
import { logSecurityAction } from '../services/loggingService.js';

const joinWindows = new Map();
const raidMode = new Map();

setInterval(() => {
  const cutoff = Date.now() - 300000;
  for (const [key, joins] of joinWindows) {
    const filtered = joins.filter(t => t > cutoff);
    if (filtered.length === 0) joinWindows.delete(key);
    else joinWindows.set(key, filtered);
  }
}, 300000);

export function isRaidMode(guildId) {
  return raidMode.get(guildId) === true;
}

export async function checkRaid(member) {
  const cfg = getGuildConfig(member.guild.id);
  if (!cfg.antiRaid.enabled) return { blocked: false };

  const now = Date.now();
  const guildId = member.guild.id;

  if (!joinWindows.has(guildId)) joinWindows.set(guildId, []);
  const joins = joinWindows.get(guildId);
  joins.push(now);

  const windowStart = now - cfg.antiRaid.windowSec * 1000;
  const recent = joins.filter(t => t > windowStart);
  joinWindows.set(guildId, recent);

  if (recent.length >= cfg.antiRaid.threshold) {
    raidMode.set(guildId, true);
    setTimeout(() => { if (raidMode.get(guildId) === true) raidMode.delete(guildId); }, 600000);
    await logSecurityAction(member.guild, 'RAID_DETECTED', {
      joinsInWindow: recent.length,
      window: `${cfg.antiRaid.windowSec}s`,
    });
    return { blocked: true, reason: 'Raid detected. Joins are being monitored.' };
  }

  return { blocked: false };
}

export function disableRaidMode(guildId) {
  raidMode.delete(guildId);
  joinWindows.delete(guildId);
}
