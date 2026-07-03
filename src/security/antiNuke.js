import { getGuildConfig } from '../store/guildConfig.js';
import { logSecurityAction } from '../services/loggingService.js';

const eventWindows = new Map();

setInterval(() => {
  const cutoff = Date.now() - 60000;
  for (const [key, events] of eventWindows) {
    const filtered = events.filter(t => t > cutoff);
    if (filtered.length === 0) eventWindows.delete(key);
    else eventWindows.set(key, filtered);
  }
}, 120000);

function track(guildId, eventType) {
  const cfg = getGuildConfig(guildId);
  if (!cfg.antiNuke.enabled) return { triggered: false };

  const now = Date.now();
  const key = `${guildId}:${eventType}`;

  if (!eventWindows.has(key)) eventWindows.set(key, []);
  const events = eventWindows.get(key);
  events.push(now);

  const windowStart = now - cfg.antiNuke.windowSec * 1000;
  const recent = events.filter(t => t > windowStart);
  eventWindows.set(key, recent);

  return {
    triggered: recent.length >= cfg.antiNuke.threshold,
    count: recent.length,
    threshold: cfg.antiNuke.threshold,
  };
}

export async function checkNuke(guild, eventType, executor) {
  const result = track(guild.id, eventType);
  if (!result.triggered) return { blocked: false };

  await logSecurityAction(guild, `NUKE_${eventType.toUpperCase()}`, {
    executor: executor?.tag || 'unknown',
    count: result.count,
    threshold: result.threshold,
  }, executor);

  return { blocked: true, reason: `Mass ${eventType} detected (${result.count} in ${getGuildConfig(guild.id).antiNuke.windowSec}s). Action blocked.` };
}

const WATCHED_EVENTS = ['channelDelete', 'roleDelete', 'ban', 'kick'];
export function isNukeEvent(eventType) {
  return WATCHED_EVENTS.includes(eventType);
}
