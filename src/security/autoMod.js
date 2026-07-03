import { EmbedBuilder } from 'discord.js';
import { getGuildConfig } from '../store/guildConfig.js';

const BANNED_WORDS = [
  /discord\.gg\/[A-Za-z0-9]+/i,
  /@everyone/g,
  /@here/g,
];

const MAX_MENTIONS = 6;
const MAX_LINE_LENGTH = 1000;

export async function runAutoMod(message) {
  const cfg = getGuildConfig(message.guild.id);
  if (!cfg.autoMod.enabled) return { flagged: false };

  // Check mentions
  if (message.mentions.users.size > MAX_MENTIONS) {
    return flag(message, 'Mass mentions');
  }

  // Check message length
  if (message.content.length > MAX_LINE_LENGTH) {
    return flag(message, 'Message too long');
  }

  // Check banned words
  for (const pattern of BANNED_WORDS) {
    if (pattern.test(message.content)) {
      return flag(message, `Matched pattern: ${pattern}`);
    }
  }

  // Check for repeated characters
  const repeatMatch = message.content.match(/(.)\1{15,}/);
  if (repeatMatch) {
    return flag(message, 'Repeated characters');
  }

  return { flagged: false };
}

async function flag(message, reason) {
  try {
    await message.delete();
  } catch {}
  try {
    const { sendToLogChannel } = await import('../services/loggingService.js');
    const { EmbedBuilder } = await import('discord.js');
    const embed = new EmbedBuilder()
      .setColor(0xed4245)
      .setDescription(`**AutoMod flagged** <@${message.author.id}> in ${message.channel}\nReason: ${reason}\n\`\`\`${message.content.slice(0, 500)}\`\`\``)
      .setTimestamp();
    await sendToLogChannel(message.guild, embed);
  } catch {}
  return { flagged: true, reason };
}
