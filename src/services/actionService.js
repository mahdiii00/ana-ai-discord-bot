import { ChannelType } from 'discord.js';
import { extractUserId, parseDuration, parseMessageCount } from '../utils/helpers.js';
import { logAction } from './loggingService.js';

let ms = 0; let until = null; let channel = null; let target = null; let role = null; let oldName = null; let deleted = null; let result = null;

export async function executeAction(guild, member, intent) {
  const { action } = intent;
  try {
    switch (action) {
      case 'kick': return await kickUser(guild, member, intent);
      case 'ban': return await banUser(guild, member, intent);
      case 'unban': return await unbanUser(guild, member, intent);
      case 'timeout': return await timeoutUser(guild, member, intent);
      case 'warn': return await warnUser(guild, member, intent);
      case 'nickname': return await setNickname(guild, member, intent);
      case 'create_role': return await createRole(guild, member, intent);
      case 'delete_role': return await deleteRole(guild, member, intent);
      case 'rename_role': return await renameRole(guild, member, intent);
      case 'assign_role': return await assignRole(guild, member, intent);
      case 'remove_role': return await removeRole(guild, member, intent);
      case 'list_roles': return await listRoles(guild, member, intent);
      case 'create_channel': return await createChannel(guild, member, intent);
      case 'delete_channel': return await deleteChannel(guild, member, intent);
      case 'rename_channel': return await renameChannel(guild, member, intent);
      case 'move_channel': return await moveChannel(guild, member, intent);
      case 'lock_channel': return await lockChannel(guild, member, intent);
      case 'unlock_channel': return await unlockChannel(guild, member, intent);
      case 'slowmode': return await setSlowmode(guild, member, intent);
      case 'channel_topic': return await setChannelTopic(guild, member, intent);
      case 'create_category': return await createCategory(guild, member, intent);
      case 'create_thread': return await createThread(guild, member, intent);
      case 'delete_thread': return await deleteThread(guild, member, intent);
      case 'archive_thread': return await archiveThread(guild, member, intent);
      case 'unarchive_thread': return await unarchiveThread(guild, member, intent);
      case 'voice_move': return await voiceMove(guild, member, intent);
      case 'voice_disconnect': return await voiceDisconnect(guild, member, intent);
      case 'voice_mute': return await voiceMute(guild, member, intent);
      case 'voice_unmute': return await voiceUnmute(guild, member, intent);
      case 'voice_deafen': return await voiceDeafen(guild, member, intent);
      case 'voice_undeafen': return await voiceUndeafen(guild, member, intent);
      case 'rename_server': return await renameServer(guild, member, intent);
      case 'server_description': return await setServerDescription(guild, member, intent);
      case 'server_icon': return await setServerIcon(guild, member, intent);
      case 'clear_messages': return await clearMessages(guild, member, intent);
      case 'change_permissions': return await changePermissions(guild, member, intent);
      case 'add_emoji': return await addEmoji(guild, member, intent);
      case 'remove_emoji': return await removeEmoji(guild, member, intent);
      default:
        return { success: false, message: intent.message || 'Unknown.' };
    }
  } catch (error) {
    console.error(`[ActionService] ${action} error:`, error);
    return { success: false, message: `Failed: ${error.message}` };
  }
}

async function resolveMember(guild, identifier) {
  const id = extractUserId(identifier);
  if (id) { try { return await guild.members.fetch(id); } catch { return null; } }
  return null;
}

async function resolveRole(guild, identifier) {
  const id = extractUserId(identifier);
  if (id) { try { return await guild.roles.fetch(id); } catch { return null; } }
  return guild.roles.cache.find(r => r.name.toLowerCase() === identifier?.toLowerCase()) || null;
}

async function resolveChannel(guild, identifier) {
  const id = extractUserId(identifier);
  if (id) { try { return await guild.channels.fetch(id); } catch { return null; } }
  return guild.channels.cache.find(c => c.name.toLowerCase() === identifier?.toLowerCase()) || null;
}

/* ── User management ── */

async function kickUser(guild, member, intent) {
  target = await resolveMember(guild, intent.target);
  if (!target) return { success: false, message: 'User not found.' };
  if (!target.kickable) return { success: false, message: 'Can\'t kick that user.' };
  await target.kick(intent.reason || '');
  await logAction(guild, 'kick', { target: target.user.tag }, member);
  return { success: true, message: `Kicked ${target.user.tag}.` };
}

async function banUser(guild, member, intent) {
  target = await resolveMember(guild, intent.target);
  if (!target) return { success: false, message: 'User not found.' };
  if (!target.bannable) return { success: false, message: 'Can\'t ban that user.' };
  await target.ban({ reason: intent.reason || '' });
  await logAction(guild, 'ban', { target: target.user.tag }, member);
  return { success: true, message: `Banned ${target.user.tag}.` };
}

async function unbanUser(guild, member, intent) {
  const bans = await guild.bans.fetch();
  const banned = bans.find(b => b.user.id === extractUserId(intent.target) || b.user.tag.toLowerCase().includes((intent.target || '').toLowerCase()));
  if (!banned) return { success: false, message: 'That user is not banned.' };
  await guild.bans.remove(banned.user.id, `Unbanned by ${member.user.tag}`);
  await logAction(guild, 'unban', { target: banned.user.tag }, member);
  return { success: true, message: `Unbanned ${banned.user.tag}.` };
}

async function timeoutUser(guild, member, intent) {
  target = await resolveMember(guild, intent.target);
  if (!target) return { success: false, message: 'User not found.' };
  ms = parseDuration(intent.duration);
  if (!ms) return { success: false, message: 'Invalid duration. Use 10m, 1h, 1d, etc.' };
  await target.timeout(ms, intent.reason || '');
  await logAction(guild, 'timeout', { target: target.user.tag, duration: intent.duration }, member);
  return { success: true, message: `Timed out ${target.user.tag} for ${intent.duration}.` };
}

async function warnUser(guild, member, intent) {
  target = await resolveMember(guild, intent.target);
  if (!target) return { success: false, message: 'User not found.' };
  await logAction(guild, 'warn', { target: target.user.tag, reason: intent.reason }, member);
  return { success: true, message: `Warned ${target.user.tag}.` };
}

async function setNickname(guild, member, intent) {
  target = await resolveMember(guild, intent.target);
  if (!target) return { success: false, message: 'User not found.' };
  if (!target.manageable) return { success: false, message: 'Can\'t change their nickname.' };
  oldName = target.displayName;
  await target.setNickname(intent.name, `Changed by ${member.user.tag}`);
  await logAction(guild, 'nickname', { target: target.user.tag, from: oldName, to: intent.name }, member);
  return { success: true, message: `Nickname set to **${intent.name}**.` };
}

/* ── Roles ── */

async function createRole(guild, member, intent) {
  role = await guild.roles.create({
    name: intent.name || 'new-role',
    color: intent.color || undefined,
    permissions: intent.permissions || [],
    reason: `Created by ${member.user.tag}`,
  });
  await logAction(guild, 'create_role', { name: role.name }, member);
  return { success: true, message: `Role **${role.name}** created.` };
}

async function deleteRole(guild, member, intent) {
  role = await resolveRole(guild, intent.target);
  if (!role) return { success: false, message: 'Role not found.' };
  if (!role.editable) return { success: false, message: 'Can\'t delete that role.' };
  if (role.id === guild.id) return { success: false, message: 'Can\'t delete @everyone.' };
  await role.delete(`Deleted by ${member.user.tag}`);
  await logAction(guild, 'delete_role', { role: role.name }, member);
  return { success: true, message: `Deleted role **${role.name}**.` };
}

async function renameRole(guild, member, intent) {
  role = await resolveRole(guild, intent.target);
  if (!role) return { success: false, message: 'Role not found.' };
  oldName = role.name;
  await role.setName(intent.name, `Renamed by ${member.user.tag}`);
  await logAction(guild, 'rename_role', { from: oldName, to: intent.name }, member);
  return { success: true, message: `Renamed **${oldName}** → **${intent.name}**.` };
}

async function assignRole(guild, member, intent) {
  target = await resolveMember(guild, intent.target);
  if (!target) return { success: false, message: 'User not found.' };
  role = await resolveRole(guild, intent.role);
  if (!role) return { success: false, message: 'Role not found.' };
  if (target.roles.cache.has(role.id)) return { success: false, message: `Already has **${role.name}**.` };
  await target.roles.add(role, `Assigned by ${member.user.tag}`);
  await logAction(guild, 'assign_role', { target: target.user.tag, role: role.name }, member);
  return { success: true, message: `Gave **${role.name}** to ${target.user.tag}.` };
}

async function removeRole(guild, member, intent) {
  target = await resolveMember(guild, intent.target);
  if (!target) return { success: false, message: 'User not found.' };
  role = await resolveRole(guild, intent.role);
  if (!role) return { success: false, message: 'Role not found.' };
  if (!target.roles.cache.has(role.id)) return { success: false, message: `Doesn't have **${role.name}**.` };
  await target.roles.remove(role, `Removed by ${member.user.tag}`);
  await logAction(guild, 'remove_role', { target: target.user.tag, role: role.name }, member);
  return { success: true, message: `Removed **${role.name}** from ${target.user.tag}.` };
}

async function listRoles(guild, member, intent) {
  const list = guild.roles.cache
    .filter(r => r.id !== guild.id)
    .sort((a, b) => b.position - a.position)
    .map(r => `**${r.name}**`)
    .join(', ');
  return { success: true, message: list || 'No roles.' };
}

/* ── Channels ── */

async function createChannel(guild, member, intent) {
  const types = { text: ChannelType.GuildText, voice: ChannelType.GuildVoice, announcement: ChannelType.GuildAnnouncement };
  const type = types[intent.type] || ChannelType.GuildText;
  let parent = null;
  if (intent.category) {
    parent = guild.channels.cache.find(c => c.type === ChannelType.GuildCategory && c.name.toLowerCase() === intent.category.toLowerCase());
  }
  channel = await guild.channels.create({
    name: intent.name || 'new-channel', type, parent: parent?.id || undefined,
    reason: `Created by ${member.user.tag}`,
  });
  await logAction(guild, 'create_channel', { name: channel.name, type: intent.type }, member);
  return { success: true, message: `Created **${channel.name}**.` };
}

async function deleteChannel(guild, member, intent) {
  channel = await resolveChannel(guild, intent.target);
  if (!channel) return { success: false, message: 'Channel not found.' };
  if (!channel.deletable) return { success: false, message: 'Can\'t delete that channel.' };
  await channel.delete(`Deleted by ${member.user.tag}`);
  await logAction(guild, 'delete_channel', { channel: channel.name }, member);
  return { success: true, message: `Deleted **${channel.name}**.` };
}

async function renameChannel(guild, member, intent) {
  channel = await resolveChannel(guild, intent.target);
  if (!channel) return { success: false, message: 'Channel not found.' };
  oldName = channel.name;
  await channel.setName(intent.name, `Renamed by ${member.user.tag}`);
  await logAction(guild, 'rename_channel', { from: oldName, to: intent.name }, member);
  return { success: true, message: `Renamed to **${intent.name}**.` };
}

async function lockChannel(guild, member, intent) {
  channel = intent.target ? await resolveChannel(guild, intent.target) : null;
  if (!channel) channel = guild.channels.cache.get(intent.sourceChannelId);
  if (!channel) return { success: false, message: 'Channel not found.' };
  await channel.permissionOverwrites.edit(guild.roles.everyone, {
    SendMessages: false, AddReactions: false, CreatePublicThreads: false, CreatePrivateThreads: false,
  });
  await logAction(guild, 'lock_channel', { channel: channel.name }, member);
  return { success: true, message: `Locked **${channel.name}**.` };
}

async function unlockChannel(guild, member, intent) {
  channel = intent.target ? await resolveChannel(guild, intent.target) : null;
  if (!channel) channel = guild.channels.cache.get(intent.sourceChannelId);
  if (!channel) return { success: false, message: 'Channel not found.' };
  await channel.permissionOverwrites.edit(guild.roles.everyone, {
    SendMessages: null, AddReactions: null, CreatePublicThreads: null, CreatePrivateThreads: null,
  });
  await logAction(guild, 'unlock_channel', { channel: channel.name }, member);
  return { success: true, message: `Unlocked **${channel.name}**.` };
}

async function setSlowmode(guild, member, intent) {
  channel = intent.target ? await resolveChannel(guild, intent.target) : null;
  if (!channel) channel = guild.channels.cache.get(intent.sourceChannelId);
  if (!channel) return { success: false, message: 'Channel not found.' };
  const seconds = parseInt(intent.seconds) || 0;
  await channel.setRateLimitPerUser(seconds, `Set by ${member.user.tag}`);
  await logAction(guild, 'slowmode', { channel: channel.name, seconds }, member);
  return { success: true, message: seconds > 0 ? `Slowmode set to ${seconds}s.` : 'Slowmode removed.' };
}

async function setChannelTopic(guild, member, intent) {
  channel = intent.target ? await resolveChannel(guild, intent.target) : null;
  if (!channel) channel = guild.channels.cache.get(intent.sourceChannelId);
  if (!channel) return { success: false, message: 'Channel not found.' };
  await channel.setTopic(intent.topic || '', `Set by ${member.user.tag}`);
  await logAction(guild, 'channel_topic', { channel: channel.name, topic: intent.topic }, member);
  return { success: true, message: 'Topic updated.' };
}

async function moveChannel(guild, member, intent) {
  channel = await resolveChannel(guild, intent.target);
  if (!channel) return { success: false, message: 'Channel not found.' };
  const category = guild.channels.cache.find(c => c.type === ChannelType.GuildCategory && c.name.toLowerCase() === intent.category?.toLowerCase());
  if (!category) return { success: false, message: `Category "${intent.category}" not found.` };
  await channel.setParent(category.id, { reason: `Moved by ${member.user.tag}` });
  await logAction(guild, 'move_channel', { channel: channel.name, category: category.name }, member);
  return { success: true, message: `Moved to **${category.name}**.` };
}

async function createCategory(guild, member, intent) {
  const category = await guild.channels.create({
    name: intent.name || 'new-category', type: ChannelType.GuildCategory,
    reason: `Created by ${member.user.tag}`,
  });
  await logAction(guild, 'create_category', { name: category.name }, member);
  return { success: true, message: `Category **${category.name}** created.` };
}

/* ── Threads ── */

async function createThread(guild, member, intent) {
  channel = guild.channels.cache.get(intent.sourceChannelId);
  if (!channel || !channel.isTextBased()) return { success: false, message: 'Not a text channel.' };
  const thread = await channel.threads.create({
    name: intent.name || 'thread',
    autoArchiveDuration: intent.duration || 60,
    reason: `Created by ${member.user.tag}`,
  });
  await logAction(guild, 'create_thread', { name: thread.name }, member);
  return { success: true, message: `Thread **${thread.name}** created.` };
}

async function deleteThread(guild, member, intent) {
  channel = await resolveChannel(guild, intent.target);
  if (!channel || !channel.isThread()) return { success: false, message: 'Thread not found.' };
  if (!channel.manageable) return { success: false, message: 'Can\'t delete that thread.' };
  await channel.delete(`Deleted by ${member.user.tag}`);
  await logAction(guild, 'delete_thread', { thread: channel.name }, member);
  return { success: true, message: 'Thread deleted.' };
}

async function archiveThread(guild, member, intent) {
  channel = await resolveChannel(guild, intent.target);
  if (!channel || !channel.isThread()) return { success: false, message: 'Thread not found.' };
  await channel.setArchived(true, `Archived by ${member.user.tag}`);
  await logAction(guild, 'archive_thread', { thread: channel.name }, member);
  return { success: true, message: 'Thread archived.' };
}

async function unarchiveThread(guild, member, intent) {
  channel = await resolveChannel(guild, intent.target);
  if (!channel || !channel.isThread()) return { success: false, message: 'Thread not found.' };
  await channel.setArchived(false, `Unarchived by ${member.user.tag}`);
  await logAction(guild, 'unarchive_thread', { thread: channel.name }, member);
  return { success: true, message: 'Thread unarchived.' };
}

/* ── Voice ── */

async function voiceMove(guild, member, intent) {
  target = await resolveMember(guild, intent.target);
  if (!target) return { success: false, message: 'User not found.' };
  if (!target.voice.channel) return { success: false, message: 'Not in a voice channel.' };
  channel = await resolveChannel(guild, intent.channel);
  if (!channel || channel.type !== ChannelType.GuildVoice) return { success: false, message: 'Voice channel not found.' };
  await target.voice.setChannel(channel.id, `Moved by ${member.user.tag}`);
  await logAction(guild, 'voice_move', { target: target.user.tag, to: channel.name }, member);
  return { success: true, message: `Moved ${target.user.tag} to **${channel.name}**.` };
}

async function voiceDisconnect(guild, member, intent) {
  target = await resolveMember(guild, intent.target);
  if (!target) return { success: false, message: 'User not found.' };
  if (!target.voice.channel) return { success: false, message: 'Not in a voice channel.' };
  await target.voice.disconnect(`Disconnected by ${member.user.tag}`);
  await logAction(guild, 'voice_disconnect', { target: target.user.tag }, member);
  return { success: true, message: `Disconnected ${target.user.tag}.` };
}

async function voiceMute(guild, member, intent) {
  target = await resolveMember(guild, intent.target);
  if (!target) return { success: false, message: 'User not found.' };
  if (!target.voice.channel) return { success: false, message: 'Not in a voice channel.' };
  await target.voice.setMute(true, `Muted by ${member.user.tag}`);
  await logAction(guild, 'voice_mute', { target: target.user.tag }, member);
  return { success: true, message: `Muted ${target.user.tag} in voice.` };
}

async function voiceUnmute(guild, member, intent) {
  target = await resolveMember(guild, intent.target);
  if (!target) return { success: false, message: 'User not found.' };
  if (!target.voice.channel) return { success: false, message: 'Not in a voice channel.' };
  await target.voice.setMute(false, `Unmuted by ${member.user.tag}`);
  await logAction(guild, 'voice_unmute', { target: target.user.tag }, member);
  return { success: true, message: `Unmuted ${target.user.tag} in voice.` };
}

async function voiceDeafen(guild, member, intent) {
  target = await resolveMember(guild, intent.target);
  if (!target) return { success: false, message: 'User not found.' };
  if (!target.voice.channel) return { success: false, message: 'Not in a voice channel.' };
  await target.voice.setDeaf(true, `Deafened by ${member.user.tag}`);
  await logAction(guild, 'voice_deafen', { target: target.user.tag }, member);
  return { success: true, message: `Deafened ${target.user.tag}.` };
}

async function voiceUndeafen(guild, member, intent) {
  target = await resolveMember(guild, intent.target);
  if (!target) return { success: false, message: 'User not found.' };
  if (!target.voice.channel) return { success: false, message: 'Not in a voice channel.' };
  await target.voice.setDeaf(false, `Undeafened by ${member.user.tag}`);
  await logAction(guild, 'voice_undeafen', { target: target.user.tag }, member);
  return { success: true, message: `Undeafened ${target.user.tag}.` };
}

/* ── Server ── */

async function renameServer(guild, member, intent) {
  oldName = guild.name;
  await guild.setName(intent.name, `Renamed by ${member.user.tag}`);
  await logAction(guild, 'rename_server', { from: oldName, to: intent.name }, member);
  return { success: true, message: `Server renamed to **${intent.name}**.` };
}

async function setServerDescription(guild, member, intent) {
  await guild.setDescription(intent.description || null, `Set by ${member.user.tag}`);
  await logAction(guild, 'server_description', { description: intent.description }, member);
  return { success: true, message: 'Description updated.' };
}

async function setServerIcon(guild, member, intent) {
  if (!intent.url) return { success: false, message: 'No image URL provided.' };
  await guild.setIcon(intent.url, `Set by ${member.user.tag}`);
  await logAction(guild, 'server_icon', {}, member);
  return { success: true, message: 'Server icon updated.' };
}

/* ── Messages ── */

async function clearMessages(guild, member, intent) {
  const count = parseMessageCount(intent.count) || 10;
  channel = intent.target ? await resolveChannel(guild, intent.target) : null;
  if (!channel) channel = guild.channels.cache.get(intent.sourceChannelId);
  if (!channel) return { success: false, message: 'Channel not found.' };
  if (!channel.isTextBased()) return { success: false, message: 'Not a text channel.' };
  deleted = await channel.bulkDelete(count, true);
  await logAction(guild, 'clear_messages', { channel: channel.name, count: deleted.size }, member);
  return { success: true, message: `Cleared ${deleted.size} messages.` };
}

/* ── Permissions ── */

async function changePermissions(guild, member, intent) {
  channel = intent.target ? await resolveChannel(guild, intent.target) : null;
  if (!channel) channel = guild.channels.cache.get(intent.sourceChannelId);
  if (!channel) return { success: false, message: 'Channel not found.' };
  role = await resolveRole(guild, intent.role);
  if (!role) return { success: false, message: 'Role not found.' };
  const overwrites = {};
  if (intent.allow) for (const p of intent.allow) overwrites[p] = true;
  if (intent.deny) for (const p of intent.deny) overwrites[p] = false;
  await channel.permissionOverwrites.edit(role, overwrites);
  await logAction(guild, 'change_permissions', { channel: channel.name, role: role.name, allow: intent.allow, deny: intent.deny }, member);
  return { success: true, message: `Permissions updated for **${role.name}**.` };
}

/* ── Emojis ── */

async function addEmoji(guild, member, intent) {
  if (!intent.url) return { success: false, message: 'No image URL.' };
  const emoji = await guild.emojis.create({ attachment: intent.url, name: intent.name || 'emoji', reason: `Added by ${member.user.tag}` });
  await logAction(guild, 'add_emoji', { name: emoji.name }, member);
  return { success: true, message: `Emoji **${emoji.name}** added.` };
}

async function removeEmoji(guild, member, intent) {
  const emoji = guild.emojis.cache.find(e => e.name === intent.target || e.id === extractUserId(intent.target));
  if (!emoji) return { success: false, message: 'Emoji not found.' };
  await emoji.delete(`Removed by ${member.user.tag}`);
  await logAction(guild, 'remove_emoji', { name: emoji.name }, member);
  return { success: true, message: `Emoji **${emoji.name}** removed.` };
}
