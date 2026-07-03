import { EmbedBuilder } from 'discord.js';
import { getGuildConfig } from '../store/guildConfig.js';
import { sendToLogChannel } from '../services/loggingService.js';

export async function handleMessageUpdate(oldMessage, newMessage) {
  if (!newMessage.guild) return;
  if (newMessage.author?.bot) return;
  if (oldMessage.content === newMessage.content) return;

  const cfg = getGuildConfig(newMessage.guild.id);
  if (!cfg.messageLogs) return;

  const embed = new EmbedBuilder()
    .setColor(0xfee75c)
    .setAuthor({ name: newMessage.author?.tag || 'Unknown', iconURL: newMessage.author?.displayAvatarURL() })
    .setDescription(`✏️ Message edited in ${newMessage.channel} ([jump](${newMessage.url}))`)
    .addFields(
      { name: 'Before', value: oldMessage.content?.substring(0, 500) || '*Empty*' },
      { name: 'After', value: newMessage.content?.substring(0, 500) || '*Empty*' },
    )
    .setFooter({ text: `Author: ${newMessage.author?.id}` })
    .setTimestamp();

  await sendToLogChannel(newMessage.guild, embed);
}
