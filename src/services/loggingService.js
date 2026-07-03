import { EmbedBuilder } from 'discord.js';
import { config } from '../config/index.js';
import { getGuildConfig } from '../store/guildConfig.js';
import { persistAuditLog } from './auditStore.js';

const logHistory = [];
const MAX_LOG_HISTORY = 1000;

export function getLogHistory() {
  return logHistory;
}

export async function logAction(guild, action, details, executor) {
  const timestamp = new Date().toISOString();
  const entry = { timestamp, action, details, executor: executor?.tag || executor?.id || 'unknown' };
  logHistory.push(entry);
  if (logHistory.length > MAX_LOG_HISTORY) logHistory.shift();
  console.log(`[${timestamp}] ${executor?.tag || 'unknown'} -> ${action}: ${JSON.stringify(details)}`);

  persistAuditLog(guild?.id, action, details, executor?.tag || 'unknown', executor?.id, 'info');

  const logChannelId = getGuildConfig(guild?.id).logChannelId || config.discord.logChannelId;
  if (!logChannelId || !guild) return;

  try {
    const logChannel = guild.channels.cache.get(logChannelId);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setColor(0x2b2d31)
      .setAuthor({ name: executor?.tag || 'Unknown', iconURL: executor?.displayAvatarURL() })
      .setDescription(`**Action:** \`${action}\`\n\`\`\`json\n${JSON.stringify(details, null, 2)}\n\`\`\``)
      .setFooter({ text: `User ID: ${executor?.id || 'unknown'}` })
      .setTimestamp();

    await logChannel.send({ embeds: [embed] });
  } catch (error) {
    console.error('[Logging] Failed to send log:', error.message);
  }
}

export async function logSecurityAction(guild, action, details, executor) {
  const timestamp = new Date().toISOString();
  const entry = { timestamp, action, details, executor: executor?.tag || 'system' };
  logHistory.push(entry);
  if (logHistory.length > MAX_LOG_HISTORY) logHistory.shift();
  console.log(`[SECURITY][${timestamp}] ${action}: ${JSON.stringify(details)}`);

  persistAuditLog(guild?.id, action, details, executor?.tag || 'system', executor?.id || '', 'warn');

  const logChannelId = getGuildConfig(guild?.id).logChannelId || config.discord.logChannelId;
  if (!logChannelId || !guild) return;

  try {
    const logChannel = guild.channels.cache.get(logChannelId);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setColor(0xed4245)
      .setAuthor({ name: 'Security', iconURL: guild.iconURL() })
      .setTitle(`Security ${action}`)
      .setDescription(`\`\`\`json\n${JSON.stringify(details, null, 2)}\n\`\`\``)
      .setTimestamp();

    await logChannel.send({ embeds: [embed] });
  } catch (error) {
    console.error('[Logging] Failed to send security log:', error.message);
  }
}

export async function sendToLogChannel(guild, embed) {
  const logChannelId = getGuildConfig(guild?.id).logChannelId || config.discord.logChannelId;
  if (!logChannelId || !guild) return;
  try {
    const channel = guild.channels.cache.get(logChannelId);
    if (channel) await channel.send({ embeds: [embed] });
  } catch (e) {
    console.error('[Logging] sendToLogChannel failed:', e.message);
  }
}
