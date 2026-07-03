import { EmbedBuilder } from 'discord.js';
import { getGuildConfig } from '../store/guildConfig.js';
import { sendToLogChannel } from '../services/loggingService.js';

export async function handleMessageDelete(message) {
  if (!message.guild) return;
  if (message.author?.bot) return;

  const cfg = getGuildConfig(message.guild.id);
  if (!cfg.messageLogs) return;

  const embed = new EmbedBuilder()
    .setColor(0xed4245)
    .setAuthor({ name: message.author?.tag || 'Unknown', iconURL: message.author?.displayAvatarURL() })
    .setDescription(`🗑️ Message deleted in ${message.channel}`)
    .addFields(
      { name: 'Content', value: message.content ? message.content.substring(0, 1000) : '*Embed only*' },
    )
    .setFooter({ text: `Author: ${message.author?.id} | Msg: ${message.id}` })
    .setTimestamp();

  await sendToLogChannel(message.guild, embed);
}
