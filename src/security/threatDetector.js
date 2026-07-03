import { config } from '../config/index.js';
import { isPanicMode } from './panicMode.js';
import { isWhitelisted, isBlacklisted } from './whitelistBlacklist.js';
import { isRaidMode } from './antiRaid.js';
import { GroqProvider } from '../llm/GroqProvider.js';

const groq = new GroqProvider(config.groq.apiKey, config.groq.model);

const THREAT_PROMPT = `You are a Discord security analyst. Determine if a moderation action is potentially malicious.

Return JSON: {"threatLevel":"safe|suspicious|dangerous","reason":"brief explanation"}

Consider:
- Deleting many roles or channels at once
- Banning or kicking admins
- Changing server ownership transfer
- Granting Administrator permission
- Actions during off-hours or during a known raid
- Mass permissions changes

Be strict. If there's any doubt, mark it suspicious.`;

export async function analyzeThreat(action, intent, context = {}) {
  try {
    const result = await groq.generate(
      THREAT_PROMPT,
      [{ role: 'user', content: JSON.stringify({ action: intent.action, details: intent, context }) }]
    );
    return { threatLevel: result.threatLevel || 'safe', reason: result.reason || '' };
  } catch {
    return { threatLevel: 'safe', reason: 'Analysis unavailable' };
  }
}

export async function checkAction(guild, member, intent) {
  if (isWhitelisted(guild.id, member.id)) {
    return { blocked: false };
  }

  if (isBlacklisted(guild.id, member.id)) {
    return { blocked: true, reason: 'User is blacklisted.' };
  }

  if (isPanicMode(guild.id) && !['unlock', 'disable_panic'].includes(intent.action)) {
    return { blocked: true, reason: 'Server is in panic mode.' };
  }

  const dangerousActions = ['ban', 'kick', 'delete_channel', 'delete_role', 'clear_messages', 'change_permissions', 'rename_server', 'voice_disconnect'];
  if (dangerousActions.includes(intent.action)) {
    const threat = await analyzeThreat('admin_action', intent, {
      guildId: guild.id,
      memberId: member.id,
      raidMode: isRaidMode(guild.id),
    });

    if (threat.threatLevel === 'dangerous') {
      return { blocked: true, reason: `Warning AI threat detected: ${threat.reason}` };
    }

    if (threat.threatLevel === 'suspicious') {
      return { blocked: true, reason: `Warning Suspicious action flagged: ${threat.reason}` };
    }
  }

  return { blocked: false };
}
