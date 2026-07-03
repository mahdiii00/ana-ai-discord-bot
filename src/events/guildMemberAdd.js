import { EmbedBuilder } from 'discord.js';
import { getGuildConfig } from '../store/guildConfig.js';
import { sendToLogChannel } from '../services/loggingService.js';
import { checkRaid } from '../security/antiRaid.js';
import { checkBotJoin } from '../security/antiBot.js';

export async function handleGuildMemberAdd(member) {
  if (member.user.bot) {
    await checkBotJoin(member);
    return;
  }

  await checkRaid(member);

  const cfg = getGuildConfig(member.guild.id);
  if (!cfg.joinLogs) return;

  const embed = new EmbedBuilder()
    .setColor(0x57f287)
    .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
    .setDescription(`📥 **${member.user.tag}** joined the server`)
    .addFields(
      { name: 'Account Created', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
      { name: 'Member Count', value: `${member.guild.memberCount}`, inline: true },
    )
    .setTimestamp();

  if (member.user.createdTimestamp > Date.now() - 7 * 86400000) {
    embed.setColor(0xed4245).setFooter({ text: '⚠️ Account is less than 7 days old' });
  }

  await sendToLogChannel(member.guild, embed);
}
