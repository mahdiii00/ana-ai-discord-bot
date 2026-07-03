import { ChannelType, PermissionsBitField } from 'discord.js';
import { getGuildConfig } from '../store/guildConfig.js';
import { logSecurityAction } from '../services/loggingService.js';

const panicStates = new Map();
const originalOverwrites = new Map();
const PANIC_TTL = 24 * 60 * 60 * 1000;

export function isPanicMode(guildId) {
  return panicStates.get(guildId) === true;
}

export async function enablePanicMode(guild, executor) {
  if (panicStates.get(guild.id)) return { success: false, message: 'Already in panic mode.' };

  panicStates.set(guild.id, true);
  setTimeout(() => { if (panicStates.get(guild.id)) { panicStates.delete(guild.id); originalOverwrites.delete(guild.id); } }, PANIC_TTL);

  const config = getGuildConfig(guild.id);
  config.panicMode = true;
  const saved = [];

  for (const channel of guild.channels.cache.values()) {
    if (channel.type === ChannelType.GuildCategory) continue;
    if (!channel.permissionOverwrites) continue;

    try {
      const overwrites = [...channel.permissionOverwrites.cache.entries()].map(([id, ow]) => ({
        id, type: ow.type, allow: ow.allow.bitfield.toString(), deny: ow.deny.bitfield.toString(),
      }));
      saved.push({ channelId: channel.id, overwrites });

      await channel.permissionOverwrites.edit(guild.roles.everyone, {
        SendMessages: false,
        AddReactions: false,
        CreatePublicThreads: false,
        CreatePrivateThreads: false,
        SendMessagesInThreads: false,
        AttachFiles: false,
        EmbedLinks: false,
      });

      for (const roleId of config.whitelist || []) {
        try {
          const role = guild.roles.cache.get(roleId);
          if (role && role.id !== guild.id) {
            await channel.permissionOverwrites.edit(role, { SendMessages: true });
          }
        } catch (e) {
          console.error(`[Panic] Failed to whitelist role ${roleId}:`, e.message);
        }
      }
    } catch (e) {
      console.error(`[Panic] Failed to lock channel ${channel.id}:`, e.message);
    }
  }

  originalOverwrites.set(guild.id, saved);

  await logSecurityAction(guild, 'PANIC_MODE_ENABLED', {}, executor);
  return { success: true, message: 'Panic mode enabled. All channels locked.' };
}

export async function disablePanicMode(guild, executor) {
  if (!panicStates.get(guild.id)) return { success: false, message: 'Not in panic mode.' };

  panicStates.delete(guild.id);
  const config = getGuildConfig(guild.id);
  config.panicMode = false;

  const saved = originalOverwrites.get(guild.id) || [];
  originalOverwrites.delete(guild.id);

  for (const entry of saved) {
    try {
      const channel = guild.channels.cache.get(entry.channelId);
      if (!channel) continue;

      const overwriteData = entry.overwrites.map(ow => ({
        id: ow.id,
        type: parseInt(ow.type),
        allow: ow.allow,
        deny: ow.deny,
      }));

      await channel.permissionOverwrites.set(overwriteData);
    } catch (e) {
      console.error(`[Panic] Failed to restore channel ${entry.channelId}:`, e.message);
    }
  }

  await logSecurityAction(guild, 'PANIC_MODE_DISABLED', {}, executor);
  return { success: true, message: 'Panic mode disabled. Server unlocked.' };
}
