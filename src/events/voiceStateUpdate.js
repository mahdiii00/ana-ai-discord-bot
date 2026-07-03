import { EmbedBuilder } from 'discord.js';
import { getGuildConfig } from '../store/guildConfig.js';
import { sendToLogChannel } from '../services/loggingService.js';

export async function handleVoiceStateUpdate(oldState, newState) {
  const guild = newState.guild || oldState.guild;
  if (!guild) return;

  const cfg = getGuildConfig(guild.id);
  if (!cfg.voiceLogs) return;

  const member = newState.member || oldState.member;
  if (!member) return;

  let description = '';
  let color = 0x5865f2;

  if (!oldState.channelId && newState.channelId) {
    description = `🔊 **${member.user.tag}** joined voice: ${newState.channel}`;
    color = 0x57f287;
  } else if (oldState.channelId && !newState.channelId) {
    description = `🔇 **${member.user.tag}** left voice: ${oldState.channel}`;
    color = 0xed4245;
  } else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
    description = `🔁 **${member.user.tag}** moved: ${oldState.channel} → ${newState.channel}`;
    color = 0xfee75c;
  } else if (!oldState.mute && newState.mute) {
    description = `🔇 **${member.user.tag}** was server muted in ${newState.channel}`;
    color = 0xed4245;
  } else if (oldState.mute && !newState.mute) {
    description = `🔊 **${member.user.tag}** was server unmuted in ${newState.channel}`;
    color = 0x57f287;
  } else if (!oldState.deaf && newState.deaf) {
    description = `🙉 **${member.user.tag}** was server deafened in ${newState.channel}`;
    color = 0xed4245;
  } else if (oldState.deaf && !newState.deaf) {
    description = `🙊 **${member.user.tag}** was server undeafened in ${newState.channel}`;
    color = 0x57f287;
  } else {
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(color)
    .setDescription(description)
    .setTimestamp();

  await sendToLogChannel(guild, embed);
}
