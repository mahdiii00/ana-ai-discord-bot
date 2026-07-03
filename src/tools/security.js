import { Tool } from './Tool.js';
import { createBackup, listBackups } from '../security/backupManager.js';
import { enablePanicMode, disablePanicMode } from '../security/panicMode.js';
import { addWhitelist, removeWhitelist, addBlacklist, removeBlacklist } from '../security/whitelistBlacklist.js';
import { analyzeAuditLogs } from '../security/auditAnalyzer.js';
import { getGuildConfig, updateGuildConfig } from '../store/guildConfig.js';

class PanicModeTool extends Tool {
  constructor() {
    super();
    this.name = 'panicMode';
    this.description = 'Lock down the server — deny all permissions to @everyone in all channels';
    this.parameters = {};
    this.required = [];
    this.dangerous = true;
    this.botPermissions = ['ManageChannels', 'ManageRoles'];
    this.category = 'security';
  }

  canExecute(context) {
    if (!context.isAdmin) return { allowed: false, reason: 'Only administrators can activate panic mode.' };
    const me = context.guild?.botMember;
    if (!me?.permissions?.has('ManageChannels') || !me?.permissions?.has('ManageRoles')) return { allowed: false, reason: 'I need Manage Channels and Manage Roles permissions.' };
    return { allowed: true };
  }

  async execute(context) {
    await createBackup(context.guild.botMember.guild);
    await enablePanicMode(context.guild.botMember.guild, context.guild.botMember);
    return { message: '🚨 **PANIC MODE ACTIVATED**\nAll channels locked. Use `/security unlock` or say "unlock panic" to restore.' };
  }
}

class UnlockPanicTool extends Tool {
  constructor() {
    super();
    this.name = 'unlockPanic';
    this.description = 'Restore permissions after panic mode';
    this.parameters = {};
    this.required = [];
    this.dangerous = false;
    this.botPermissions = ['ManageChannels'];
    this.category = 'security';
  }

  canExecute(context) {
    if (!context.isAdmin) return { allowed: false, reason: 'Only administrators can deactivate panic mode.' };
    return { allowed: true };
  }

  async execute(context) {
    await disablePanicMode(context.guild.botMember.guild, context.guild.botMember);
    return { message: '✅ Panic mode deactivated. Permissions restored.' };
  }
}

class CreateBackupTool extends Tool {
  constructor() {
    super();
    this.name = 'createBackup';
    this.description = 'Create a backup of all roles, channels, and permissions';
    this.parameters = {};
    this.required = [];
    this.dangerous = false;
    this.botPermissions = ['ManageRoles', 'ManageChannels'];
    this.category = 'security';
  }

  async execute(context) {
    const result = await createBackup(context.guild.botMember.guild);
    return { message: `✅ Backup created: ${result.roles} roles, ${result.categories} categories, ${result.channels} channels` };
  }
}

class ListBackupsTool extends Tool {
  constructor() {
    super();
    this.name = 'listBackups';
    this.description = 'List all available backups';
    this.parameters = {};
    this.required = [];
    this.dangerous = false;
    this.category = 'security';
  }

  async execute(context) {
    const backups = listBackups(context.guild.botMember.guild.id);
    if (backups.length === 0) return { message: '📂 No backups found.' };
    const lines = backups.map((b, i) => `${i + 1}. ${new Date(b.timestamp).toLocaleString()} — ${b.roles} roles, ${b.channels} channels`);
    return { message: `📂 **Backups:**\n${lines.join('\n')}` };
  }
}

class WhitelistAddTool extends Tool {
  constructor() {
    super();
    this.name = 'whitelistAdd';
    this.description = 'Add a user/role to the whitelist (bypasses security filters)';
    this.parameters = {
      targetId: { type: 'string', description: 'User ID or role ID' },
      type: { type: 'string', enum: ['user', 'role'], description: 'Target type' },
    };
    this.required = ['targetId', 'type'];
    this.dangerous = false;
    this.botPermissions = ['Administrator'];
    this.category = 'security';
  }

  canExecute(context) {
    if (!context.isAdmin) return { allowed: false, reason: 'Only administrators can manage whitelist.' };
    return { allowed: true };
  }

  async execute(context, args) {
    addWhitelist(context.guild.botMember.guild.id, args.targetId, args.type);
    return { message: `✅ Added ${args.type} <@${args.targetId}> to whitelist.` };
  }
}

class WhitelistRemoveTool extends Tool {
  constructor() {
    super();
    this.name = 'whitelistRemove';
    this.description = 'Remove a user/role from the whitelist';
    this.parameters = {
      targetId: { type: 'string', description: 'User ID or role ID' },
    };
    this.required = ['targetId'];
    this.dangerous = false;
    this.botPermissions = ['Administrator'];
    this.category = 'security';
  }

  canExecute(context) {
    if (!context.isAdmin) return { allowed: false, reason: 'Only administrators can manage whitelist.' };
    return { allowed: true };
  }

  async execute(context, args) {
    removeWhitelist(context.guild.botMember.guild.id, args.targetId);
    return { message: `✅ Removed <@${args.targetId}> from whitelist.` };
  }
}

class AuditTool extends Tool {
  constructor() {
    super();
    this.name = 'auditLog';
    this.description = 'Analyze audit log for suspicious activity in the last 24 hours';
    this.parameters = {};
    this.required = [];
    this.dangerous = false;
    this.botPermissions = ['ViewAuditLog'];
    this.category = 'security';
  }

  async execute(context) {
    const result = await analyzeAuditLogs(context.guild.botMember.guild);
    return { message: result };
  }
}

class ToggleModule extends Tool {
  constructor() {
    super();
    this.name = 'toggleModule';
    this.description = 'Enable or disable a security module';
    this.parameters = {
      module: { type: 'string', enum: ['antiSpam', 'antiLink', 'antiBot', 'antiScam', 'antiRaid', 'antiNuke', 'autoMod'], description: 'Module name' },
      enabled: { type: 'boolean', description: 'True to enable, false to disable' },
    };
    this.required = ['module', 'enabled'];
    this.dangerous = false;
    this.category = 'security';
  }

  canExecute(context) {
    if (!context.isAdmin) return { allowed: false, reason: 'Only administrators can toggle security modules.' };
    return { allowed: true };
  }

  async execute(context, args) {
    const guildId = context.guild.botMember.guild.id;
    const cfg = getGuildConfig(guildId);
    cfg[args.module] = args.enabled;
    updateGuildConfig(guildId, cfg);
    return { message: `✅ ${args.module} is now ${args.enabled ? 'enabled' : 'disabled'}.` };
  }
}

export function registerSecurityTools(registry) {
  for (const tool of [new PanicModeTool(), new UnlockPanicTool(), new CreateBackupTool(), new ListBackupsTool(), new WhitelistAddTool(), new WhitelistRemoveTool(), new AuditTool(), new ToggleModule()]) {
    registry.register(tool);
  }
}
