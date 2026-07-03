import { EmbedBuilder } from 'discord.js';
import { getGuildConfig } from '../store/guildConfig.js';
import { sendToLogChannel } from '../services/loggingService.js';

export async function handleChannelUpdate(oldChannel, newChannel) {
  if (!newChannel.guild) return;
  const cfg = getGuildConfig(newChannel.guild.id);
  if (!cfg.channelLogs) return;

  const changes = [];
  if (oldChannel.name !== newChannel.name) changes.push(`Name: **${oldChannel.name}** → **${newChannel.name}**`);
  if (oldChannel.topic !== newChannel.topic) changes.push(`Topic updated`);
  if (oldChannel.nsfw !== newChannel.nsfw) changes.push(`NSFW: ${newChannel.nsfw ? '✅' : '❌'}`);

  if (changes.length === 0) return;

  const embed = new EmbedBuilder()
    .setColor(0xfee75c)
    .setDescription(`📝 Channel updated: ${newChannel}\n\n${changes.join('\n')}`)
    .setTimestamp();

  await sendToLogChannel(newChannel.guild, embed);
}
