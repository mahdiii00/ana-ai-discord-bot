import { AuditLogEvent } from 'discord.js';
import { logSecurityAction } from '../services/loggingService.js';

const WINDOW_MS = 24 * 60 * 60 * 1000;

export async function analyzeAuditLogs(guild) {
  const now = Date.now();
  const cutoff = now - WINDOW_MS;
  const results = [];
  const userActionCounts = {};

  const entries = await guild.fetchAuditLogs({ limit: 100 });
  if (!entries) return results;

  for (const entry of entries.entries.values()) {
    if (entry.createdTimestamp < cutoff) continue;
    const key = `${entry.executor?.id}:${entry.action}`;
    userActionCounts[key] = (userActionCounts[key] || 0) + 1;
  }

  // Detect rapid similar actions
  for (const [key, count] of Object.entries(userActionCounts)) {
    if (count >= 5) {
      const [userId, actionName] = key.split(':');
      results.push({
        userId,
        action: actionName,
        count,
        severity: count >= 10 ? 'high' : 'medium',
        message: `${count}x ${actionName} by <@${userId}> in 24h`,
      });
    }
  }

  // Check for mass moderator actions
  const banKickKeys = Object.keys(userActionCounts).filter(k =>
    k.includes('MemberBan') || k.includes('MemberKick')
  );
  for (const key of banKickKeys) {
    const count = userActionCounts[key];
    if (count >= 3) {
      const [userId] = key.split(':');
      const user = await guild.members.fetch(userId).catch(() => null);
      await logSecurityAction(guild, 'AUDIT_ALERT', {
        user: user?.user?.tag || userId,
        action: 'Mass disciplinary actions',
        count,
      });
    }
  }

  return results;
}
