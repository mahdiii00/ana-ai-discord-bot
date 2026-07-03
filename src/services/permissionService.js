import { config } from '../config/index.js';
import { permissionLabel } from '../utils/helpers.js';

const ACTION_PERMISSIONS = {
  kick: ['KickMembers', 'Administrator'],
  ban: ['BanMembers', 'Administrator'],
  unban: ['BanMembers', 'Administrator'],
  timeout: ['ModerateMembers', 'Administrator'],
  warn: ['KickMembers', 'Administrator'],
  nickname: ['ManageNicknames', 'Administrator'],
  create_role: ['ManageRoles', 'Administrator'],
  delete_role: ['ManageRoles', 'Administrator'],
  rename_role: ['ManageRoles', 'Administrator'],
  assign_role: ['ManageRoles', 'Administrator'],
  remove_role: ['ManageRoles', 'Administrator'],
  list_roles: ['ManageRoles', 'Administrator'],
  create_channel: ['ManageChannels', 'Administrator'],
  delete_channel: ['ManageChannels', 'Administrator'],
  rename_channel: ['ManageChannels', 'Administrator'],
  move_channel: ['ManageChannels', 'Administrator'],
  lock_channel: ['ManageChannels', 'Administrator'],
  unlock_channel: ['ManageChannels', 'Administrator'],
  slowmode: ['ManageChannels', 'Administrator'],
  channel_topic: ['ManageChannels', 'Administrator'],
  create_category: ['ManageChannels', 'Administrator'],
  create_thread: ['ManageThreads', 'Administrator'],
  delete_thread: ['ManageThreads', 'Administrator'],
  archive_thread: ['ManageThreads', 'Administrator'],
  unarchive_thread: ['ManageThreads', 'Administrator'],
  voice_move: ['MoveMembers', 'Administrator'],
  voice_disconnect: ['MoveMembers', 'Administrator'],
  voice_mute: ['MuteMembers', 'Administrator'],
  voice_unmute: ['MuteMembers', 'Administrator'],
  voice_deafen: ['DeafenMembers', 'Administrator'],
  voice_undeafen: ['DeafenMembers', 'Administrator'],
  rename_server: ['ManageGuild', 'Administrator'],
  server_description: ['ManageGuild', 'Administrator'],
  server_icon: ['ManageGuild', 'Administrator'],
  clear_messages: ['ManageMessages', 'Administrator'],
  change_permissions: ['ManageRoles', 'Administrator'],
  add_emoji: ['ManageEmojisAndStickers', 'Administrator'],
  remove_emoji: ['ManageEmojisAndStickers', 'Administrator'],
};

export function checkPermissions(member, action) {
  const required = ACTION_PERMISSIONS[action];
  if (!required) return { allowed: false, missing: ['Unknown action'] };

  if (member.permissions.has('Administrator')) {
    return { allowed: true, missing: [] };
  }

  if (config.discord.adminRoleIds.some(roleId => member.roles.cache.has(roleId))) {
    return { allowed: true, missing: [] };
  }

  const missing = required.filter(perm => !member.permissions.has(perm));

  if (missing.length === 0) return { allowed: true, missing: [] };

  return {
    allowed: false,
    missing: missing.map(permissionLabel),
  };
}

export function isDangerousAction(action) {
  return ['ban', 'kick', 'delete_channel', 'clear_messages', 'delete_role', 'delete_thread', 'voice_disconnect'].includes(action);
}
