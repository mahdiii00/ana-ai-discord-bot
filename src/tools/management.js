import { Tool } from './Tool.js';
import { createBackup } from '../security/backupManager.js';

class CreateRole extends Tool {
  constructor() {
    super();
    this.name = 'createRole';
    this.description = 'Create a new role';
    this.parameters = {
      name: { type: 'string', description: 'Role name' },
      color: { type: 'string', description: 'Hex color (e.g. #FF0000)', default: '#000000' },
      hoist: { type: 'boolean', description: 'Display separately in sidebar', default: false },
      mentionable: { type: 'boolean', description: 'Allow anyone to mention', default: false },
    };
    this.required = ['name'];
    this.dangerous = false;
    this.botPermissions = ['ManageRoles'];
    this.category = 'management';
  }

  canExecute(context) {
    if (!context.isAdmin) return { allowed: false, reason: 'Only administrators can manage roles.' };
    if (!context.guild?.botMember?.permissions?.has('ManageRoles')) return { allowed: false, reason: 'I need the Manage Roles permission.' };
    return { allowed: true };
  }

  async execute(context, args) {
    const role = await context.guild.botMember.guild.roles.create({ name: args.name, color: args.color || '#000000', hoist: args.hoist || false, mentionable: args.mentionable || false, reason: `Created by ${context.username}` });
    return { message: `✅ Created role ${role.name}`, roleId: role.id };
  }
}

class DeleteRole extends Tool {
  constructor() {
    super();
    this.name = 'deleteRole';
    this.description = 'Delete a role';
    this.parameters = {
      roleId: { type: 'string', description: 'Role ID or name' },
      reason: { type: 'string', description: 'Reason', default: 'Deleted by admin' },
    };
    this.required = ['roleId'];
    this.dangerous = true;
    this.botPermissions = ['ManageRoles'];
    this.category = 'management';
  }

  canExecute(context) {
    if (!context.isAdmin) return { allowed: false, reason: 'Only administrators can manage roles.' };
    if (!context.guild?.botMember?.permissions?.has('ManageRoles')) return { allowed: false, reason: 'I need the Manage Roles permission.' };
    return { allowed: true };
  }

  async execute(context, args) {
    await createBackup(context.guild.botMember.guild);
    const role = context.guild.botMember.guild.roles.cache.get(args.roleId) || context.guild.botMember.guild.roles.cache.find(r => r.name.toLowerCase() === args.roleId.toLowerCase());
    if (!role || role.id === context.guild.botMember.guild.id) return { message: '❌ Role not found or cannot be deleted.' };
    if (role.position >= context.guild.botMember.guild.members.me.roles.highest.position) return { message: "❌ That role is higher than mine. I can't delete it." };
    await role.delete(args.reason || 'Deleted by admin');
    return { message: `🗑️ Deleted role ${role.name}`, success: true };
  }
}

class CreateChannel extends Tool {
  constructor() {
    super();
    this.name = 'createChannel';
    this.description = 'Create a new text or voice channel';
    this.parameters = {
      name: { type: 'string', description: 'Channel name (lowercase, no spaces)' },
      type: { type: 'string', enum: ['text', 'voice'], description: 'Channel type', default: 'text' },
      category: { type: 'string', description: 'Category name or ID (optional)' },
    };
    this.required = ['name'];
    this.dangerous = false;
    this.botPermissions = ['ManageChannels'];
    this.category = 'management';
  }

  canExecute(context) {
    if (!context.isAdmin) return { allowed: false, reason: 'Only administrators can manage channels.' };
    if (!context.guild?.botMember?.permissions?.has('ManageChannels')) return { allowed: false, reason: 'I need the Manage Channels permission.' };
    return { allowed: true };
  }

  async execute(context, args) {
    const { ChannelType } = await import('discord.js');
    const type = args.type === 'voice' ? ChannelType.GuildVoice : ChannelType.GuildText;
    const options = { name: args.name.toLowerCase().replace(/\s+/g, '-'), type, reason: `Created by ${context.username}` };
    if (args.category) {
      const cat = context.guild.botMember.guild.channels.cache.find(c => (c.name === args.category || c.id === args.category) && c.type === ChannelType.GuildCategory);
      if (cat) options.parent = cat.id;
    }
    const channel = await context.guild.botMember.guild.channels.create(options);
    return { message: `✅ Created ${args.type || 'text'} channel #${channel.name}` };
  }
}

class DeleteChannel extends Tool {
  constructor() {
    super();
    this.name = 'deleteChannel';
    this.description = 'Delete a channel';
    this.parameters = {
      channelId: { type: 'string', description: 'Channel ID or name' },
      reason: { type: 'string', description: 'Reason', default: 'Deleted by admin' },
    };
    this.required = ['channelId'];
    this.dangerous = true;
    this.botPermissions = ['ManageChannels'];
    this.category = 'management';
  }

  canExecute(context) {
    if (!context.isAdmin) return { allowed: false, reason: 'Only administrators can manage channels.' };
    if (!context.guild?.botMember?.permissions?.has('ManageChannels')) return { allowed: false, reason: 'I need the Manage Channels permission.' };
    return { allowed: true };
  }

  async execute(context, args) {
    await createBackup(context.guild.botMember.guild);
    const channel = context.guild.botMember.guild.channels.cache.get(args.channelId) || context.guild.botMember.guild.channels.cache.find(c => c.name === args.channelId);
    if (!channel) return { message: '❌ Channel not found.' };
    await channel.delete(args.reason || 'Deleted by admin');
    return { message: `🗑️ Deleted channel #${channel.name}`, success: true };
  }
}

class MoveVoice extends Tool {
  constructor() {
    super();
    this.name = 'moveVoice';
    this.description = 'Move a user to a different voice channel';
    this.parameters = {
      userId: { type: 'string', description: 'User ID or mention' },
      channelId: { type: 'string', description: 'Target voice channel ID or name' },
    };
    this.required = ['userId', 'channelId'];
    this.dangerous = false;
    this.botPermissions = ['MoveMembers'];
    this.category = 'management';
  }

  async execute(context, args) {
    const member = await context.guild.botMember.guild.members.fetch(args.userId).catch(() => null);
    if (!member?.voice?.channel) return { message: '❌ That user is not in a voice channel.' };
    const channel = context.guild.botMember.guild.channels.cache.get(args.channelId) || context.guild.botMember.guild.channels.cache.find(c => c.name === args.channelId && c.isVoiceBased());
    if (!channel) return { message: '❌ Voice channel not found.' };
    await member.voice.setChannel(channel.id);
    return { message: `🔊 Moved <@${args.userId}> to ${channel.name}` };
  }
}

class RenameServer extends Tool {
  constructor() {
    super();
    this.name = 'renameServer';
    this.description = 'Rename the server';
    this.parameters = {
      name: { type: 'string', description: 'New server name' },
    };
    this.required = ['name'];
    this.dangerous = false;
    this.botPermissions = ['ManageGuild'];
    this.category = 'management';
  }

  canExecute(context) {
    if (!context.isAdmin) return { allowed: false, reason: 'Only administrators can rename the server.' };
    if (!context.guild?.botMember?.permissions?.has('ManageGuild')) return { allowed: false, reason: 'I need the Manage Server permission.' };
    return { allowed: true };
  }

  async execute(context, args) {
    await context.guild.botMember.guild.setName(args.name);
    return { message: `✅ Server renamed to "${args.name}"` };
  }
}

class ChangePermissions extends Tool {
  constructor() {
    super();
    this.name = 'changePermissions';
    this.description = 'Change permission overwrites for a channel or role';
    this.parameters = {
      channelId: { type: 'string', description: 'Channel ID' },
      targetId: { type: 'string', description: 'Role or user ID' },
      allow: { type: 'string', description: 'Permissions to allow (comma-separated, e.g. SEND_MESSAGES,READ_MESSAGE_HISTORY)' },
      deny: { type: 'string', description: 'Permissions to deny (comma-separated)' },
    };
    this.required = ['channelId', 'targetId'];
    this.dangerous = true;
    this.botPermissions = ['ManageChannels'];
    this.category = 'management';
  }

  canExecute(context) {
    if (!context.isAdmin) return { allowed: false, reason: 'Only administrators can change permissions.' };
    if (!context.guild?.botMember?.permissions?.has('ManageChannels')) return { allowed: false, reason: 'I need the Manage Channels permission.' };
    return { allowed: true };
  }

  async execute(context, args) {
    await createBackup(context.guild.botMember.guild);
    const channel = context.guild.botMember.guild.channels.cache.get(args.channelId);
    if (!channel) return { message: '❌ Channel not found.' };
    const perms = { Allow: args.allow ? args.allow.split(',').map(p => p.trim()) : [], Deny: args.deny ? args.deny.split(',').map(p => p.trim()) : [] };
    if (perms.Allow.length === 0 && perms.Deny.length === 0) return { message: '❌ Specify at least one permission to allow or deny.' };
    await channel.permissionOverwrites.set([{ id: args.targetId, allow: perms.Allow, deny: perms.Deny }]);
    return { message: `✅ Permissions updated for <#${args.channelId}>` };
  }
}

export function registerManagementTools(registry) {
  for (const tool of [new CreateRole(), new DeleteRole(), new CreateChannel(), new DeleteChannel(), new MoveVoice(), new RenameServer(), new ChangePermissions()]) {
    registry.register(tool);
  }
}
