import { EmbedBuilder } from 'discord.js';
import { config } from '../config/index.js';

const logHistory = [];

export function getLogHistory() {
  return logHistory;
}

export async function logAction(guild, action, details, executor) {
  const timestamp = new Date().toISOString();
  const entry = { timestamp, action, details, executor: executor?.tag || executor?.id || 'unknown' };
  logHistory.push(entry);
  console.log(`[${timestamp}] ${executor?.tag || 'unknown'} -> ${action}: ${JSON.stringify(details)}`);

  if (!config.discord.logChannelId || !guild) return;

  try {
    const logChannel = guild.channels.cache.get(config.discord.logChannelId);
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
