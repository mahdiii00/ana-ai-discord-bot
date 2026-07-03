import { EmbedBuilder, ChannelType } from 'discord.js';
import { getGuildConfig } from '../store/guildConfig.js';
import { sendToLogChannel } from '../services/loggingService.js';

export async function handleChannelCreate(channel) {
  if (!channel.guild) return;
  const cfg = getGuildConfig(channel.guild.id);
  if (!cfg.channelLogs) return;

  const embed = new EmbedBuilder()
    .setColor(0x57f287)
    .setDescription(`📝 Channel created: ${channel}`)
    .addFields(
      { name: 'Name', value: channel.name, inline: true },
      { name: 'Type', value: ChannelType[channel.type] || 'Unknown', inline: true },
      { name: 'ID', value: channel.id, inline: true },
    )
    .setTimestamp();

  await sendToLogChannel(channel.guild, embed);
}
