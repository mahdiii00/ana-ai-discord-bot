import { Tool } from './Tool.js';
import { createBackup } from '../security/backupManager.js';

class BanUser extends Tool {
  constructor() {
    super();
    this.name = 'banUser';
    this.description = 'Ban a member from the server permanently';
    this.parameters = {
      userId: { type: 'string', description: 'User ID or mention' },
      reason: { type: 'string', description: 'Reason for the ban' },
      deleteMessagesDays: { type: 'number', description: 'Delete messages from last N days (0-7)', default: 0 },
    };
    this.required = ['userId', 'reason'];
    this.dangerous = true;
    this.botPermissions = ['BanMembers'];
    this.category = 'moderation';
  }

  canExecute(context) {
    if (!context.isAdmin) return { allowed: false, reason: 'Only administrators can ban members.' };
    if (!context.guild?.botMember?.permissions?.has('BanMembers')) return { allowed: false, reason: 'I need the Ban Members permission.' };
    return { allowed: true };
  }

  async execute(context, args) {
    await createBackup(context.guild.botMember.guild);
    const user = await context.guild.botMember.guild.members.fetch(args.userId).catch(() => null);
    if (user?.bannable === false) return { message: "❌ I can't ban that user. They may have higher permissions than me." };
    await context.guild.botMember.guild.bans.create(args.userId, { reason: args.reason, deleteMessageSeconds: (args.deleteMessagesDays || 0) * 86400 });
    return { message: `🔨 Banned <@${args.userId}> — ${args.reason}`, success: true };
  }
}

class KickUser extends Tool {
  constructor() {
    super();
    this.name = 'kickUser';
    this.description = 'Kick a member from the server';
    this.parameters = {
      userId: { type: 'string', description: 'User ID or mention' },
      reason: { type: 'string', description: 'Reason for the kick' },
    };
    this.required = ['userId', 'reason'];
    this.dangerous = true;
    this.botPermissions = ['KickMembers'];
    this.category = 'moderation';
  }

  canExecute(context) {
    if (!context.isAdmin) return { allowed: false, reason: 'Only administrators can kick members.' };
    if (!context.guild?.botMember?.permissions?.has('KickMembers')) return { allowed: false, reason: 'I need the Kick Members permission.' };
    return { allowed: true };
  }

  async execute(context, args) {
    await createBackup(context.guild.botMember.guild);
    const member = await context.guild.botMember.guild.members.fetch(args.userId).catch(() => null);
    if (!member) return { message: '❌ User not found.' };
    if (!member.kickable) return { message: "❌ I can't kick that user." };
    await member.kick(args.reason);
    return { message: `👢 Kicked <@${args.userId}> — ${args.reason}`, success: true };
  }
}

class WarnUser extends Tool {
  constructor() {
    super();
    this.name = 'warnUser';
    this.description = 'Warn a member';
    this.parameters = {
      userId: { type: 'string', description: 'User ID or mention' },
      reason: { type: 'string', description: 'Warning reason' },
    };
    this.required = ['userId', 'reason'];
    this.dangerous = false;
    this.botPermissions = ['ModerateMembers'];
    this.category = 'moderation';
  }

  canExecute(context) {
    if (!context.isAdmin) return { allowed: false, reason: 'Only administrators can warn members.' };
    if (!context.guild?.botMember?.permissions?.has('ModerateMembers')) return { allowed: false, reason: 'I need the Moderate Members permission.' };
    return { allowed: true };
  }

  async execute(context, args) {
    return { message: `⚠️ <@${args.userId}> has been warned — ${args.reason}` };
  }
}

class TimeoutUser extends Tool {
  constructor() {
    super();
    this.name = 'timeoutUser';
    this.description = 'Timeout (mute) a member temporarily';
    this.parameters = {
      userId: { type: 'string', description: 'User ID or mention' },
      duration: { type: 'string', description: 'Duration (e.g. 1h, 30m, 1d)' },
      reason: { type: 'string', description: 'Reason' },
    };
    this.required = ['userId', 'duration', 'reason'];
    this.dangerous = false;
    this.botPermissions = ['ModerateMembers'];
    this.category = 'moderation';
  }

  parseDuration(d) {
    const match = d.match(/^(\d+)\s*(m|min|h|d|day|days)?$/i);
    if (!match) return 60000;
    const num = parseInt(match[1]);
    if (num > 86400) return 86400000;
    const unit = (match[2] || 'm').toLowerCase();
    const ms = unit.startsWith('d') ? 86400000 : unit.startsWith('h') ? 3600000 : 60000;
    return num * ms;
  }

  async execute(context, args) {
    const member = await context.guild.botMember.guild.members.fetch(args.userId).catch(() => null);
    if (!member?.moderatable) return { message: "❌ I can't timeout that user." };
    const ms = this.parseDuration(args.duration);
    await member.timeout(ms, args.reason);
    return { message: `🔇 Timed out <@${args.userId}> for ${args.duration} — ${args.reason}` };
  }
}

class ClearMessages extends Tool {
  constructor() {
    super();
    this.name = 'clearMessages';
    this.description = 'Delete recent messages in a channel';
    this.parameters = {
      count: { type: 'number', description: 'Number of messages to delete (1-100)' },
      channelId: { type: 'string', description: 'Channel ID (optional, defaults to current)' },
    };
    this.required = ['count'];
    this.dangerous = true;
    this.botPermissions = ['ManageMessages'];
    this.category = 'moderation';
  }

  canExecute(context) {
    if (!context.isAdmin) return { allowed: false, reason: 'Only administrators can clear messages.' };
    if (!context.guild?.botMember?.permissions?.has('ManageMessages')) return { allowed: false, reason: 'I need the Manage Messages permission.' };
    return { allowed: true };
  }

  async execute(context, args) {
    const channelId = args.channelId || context.channel.id;
    const channel = context.guild.botMember.guild.channels.cache.get(channelId);
    if (!channel) return { message: '❌ Channel not found.' };
    const count = Math.min(Math.max(1, args.count), 100);
    const messages = await channel.bulkDelete(count, true);
    return { message: `🧹 Deleted ${messages.size} messages.`, success: true };
  }
}

class UnbanUser extends Tool {
  constructor() {
    super();
    this.name = 'unbanUser';
    this.description = 'Unban a user';
    this.parameters = {
      userId: { type: 'string', description: 'User ID to unban' },
      reason: { type: 'string', description: 'Reason' },
    };
    this.required = ['userId'];
    this.dangerous = false;
    this.botPermissions = ['BanMembers'];
    this.category = 'moderation';
  }

  canExecute(context) {
    if (!context.isAdmin) return { allowed: false, reason: 'Only administrators can unban members.' };
    if (!context.guild?.botMember?.permissions?.has('BanMembers')) return { allowed: false, reason: 'I need the Ban Members permission.' };
    return { allowed: true };
  }

  async execute(context, args) {
    await context.guild.botMember.guild.bans.remove(args.userId, args.reason || 'Unbanned');
    return { message: `✅ Unbanned <@${args.userId}>` };
  }
}

export function registerModerationTools(registry) {
  for (const tool of [new BanUser(), new KickUser(), new WarnUser(), new TimeoutUser(), new ClearMessages(), new UnbanUser()]) {
    registry.register(tool);
  }
}
