import { config } from '../config/index.js';
import { getGuildConfig } from '../store/guildConfig.js';
import { checkSpam } from '../security/antiSpam.js';
import { checkLink } from '../security/antiLink.js';
import { checkScam } from '../security/antiScam.js';
import { runAutoMod } from '../security/autoMod.js';

const agentRef = { current: null };

export function setAgent(agent) {
  agentRef.current = agent;
}

export function getAgent() {
  return agentRef.current;
}

export async function handleMessage(message) {
  if (message.author.bot) return;
  if (!message.guild) return;

  const cfg = getGuildConfig(message.guild.id);

  if (cfg.antiSpam) { const r = await checkSpam(message); if (r?.blocked) return; }
  if (cfg.antiLink) { const r = checkLink(message.guild.id, message.content, message.member); if (r?.blocked) { try { await message.delete(); } catch (e) { console.error('[AntiLink] Delete failed:', e.message); } return; } }
  if (cfg.antiScam) { const r = checkScam(message.content); if (r?.blocked) { try { await message.delete(); } catch {} return; } }
  if (cfg.autoMod) { const r = await runAutoMod(message); if (r?.flagged) return; }

  const prefix = config.discord.prefix;
  const isReply = message.type === 19 && message.mentions?.repliedUser?.id === message.client.user.id;
  const isMention = message.mentions?.has(message.client.user.id);
  const isPrefix = message.content.startsWith(prefix);

  if (!isPrefix && !isMention && !isReply) return;

  const input = message.content
    .replace(/^<@!?\d+>/, '')
    .replace(prefix, '')
    .trim();

  if (!input || input.length === 0) return;

  message.channel.sendTyping();

  const agent = agentRef.current;
  if (!agent) return message.reply('❌ Agent not initialized.');

  const reply = await agent.processMessage(message);
  if (reply) message.reply(reply);
}
