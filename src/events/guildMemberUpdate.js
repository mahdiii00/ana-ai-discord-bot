import { EmbedBuilder } from 'discord.js';
import { getGuildConfig } from '../store/guildConfig.js';
import { sendToLogChannel } from '../services/loggingService.js';

export async function handleGuildMemberUpdate(oldMember, newMember) {
  const cfg = getGuildConfig(newMember.guild.id);
  if (!cfg.roleLogs) return;

  const addedRoles = newMember.roles.cache.filter(r => !oldMember.roles.cache.has(r.id) && r.id !== newMember.guild.id);
  const removedRoles = oldMember.roles.cache.filter(r => !newMember.roles.cache.has(r.id) && r.id !== newMember.guild.id);

  if (addedRoles.size === 0 && removedRoles.size === 0) return;

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setAuthor({ name: newMember.user.tag, iconURL: newMember.user.displayAvatarURL() })
    .setTimestamp();

  if (addedRoles.size > 0) {
    embed.addFields({ name: 'Roles Added', value: addedRoles.map(r => r.toString()).join(', ') });
  }
  if (removedRoles.size > 0) {
    embed.addFields({ name: 'Roles Removed', value: removedRoles.map(r => r.toString()).join(', ') });
  }

  await sendToLogChannel(newMember.guild, embed);
}
