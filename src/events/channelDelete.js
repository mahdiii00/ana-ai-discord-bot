import { EmbedBuilder, ChannelType } from 'discord.js';
import { getGuildConfig } from '../store/guildConfig.js';
import { sendToLogChannel, logSecurityAction } from '../services/loggingService.js';
import { checkNuke, isNukeEvent } from '../security/antiNuke.js';

export async function handleChannelDelete(channel) {
  if (!channel.guild) return;

  const audit = await channel.guild.fetchAuditLogs({ limit: 1, type: 12 }).catch(() => null);
  const executor = audit?.entries.first()?.executor;

  if (isNukeEvent('channelDelete')) {
    const nukeCheck = await checkNuke(channel.guild, 'channelDelete', executor);
    if (nukeCheck.blocked) {
      return;
    }
  }

  const cfg = getGuildConfig(channel.guild.id);
  if (!cfg.channelLogs) return;

  const embed = new EmbedBuilder()
    .setColor(0xed4245)
    .setDescription(`🗑️ Channel deleted: **${channel.name}**`)
    .addFields(
      { name: 'Type', value: ChannelType[channel.type] || 'Unknown', inline: true },
      { name: 'ID', value: channel.id, inline: true },
    )
    .setTimestamp();

  if (executor) embed.setAuthor({ name: executor.tag, iconURL: executor.displayAvatarURL() });

  await sendToLogChannel(channel.guild, embed);
}
