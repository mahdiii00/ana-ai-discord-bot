import { EmbedBuilder } from 'discord.js';
import { getGuildConfig } from '../store/guildConfig.js';
import { sendToLogChannel } from '../services/loggingService.js';

export async function handleGuildMemberRemove(member) {
  const cfg = getGuildConfig(member.guild.id);
  if (!cfg.leaveLogs) return;

  const embed = new EmbedBuilder()
    .setColor(0xed4245)
    .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
    .setDescription(`📤 **${member.user.tag}** left or was removed`)
    .addFields(
      { name: 'Joined', value: member.joinedAt ? `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:R>` : 'Unknown', inline: true },
      { name: 'Member Count', value: `${member.guild.memberCount}`, inline: true },
    )
    .setTimestamp();

  await sendToLogChannel(member.guild, embed);
}
