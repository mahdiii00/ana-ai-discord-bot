import { Tool } from './Tool.js';

class ServerInfo extends Tool {
  constructor() {
    super();
    this.name = 'serverInfo';
    this.description = 'Get information about the server';
    this.parameters = {};
    this.required = [];
    this.dangerous = false;
    this.category = 'information';
  }

  async execute(context) {
    const g = context.guild?.botMember?.guild;
    if (!g) return { message: 'This command must be used in a server.' };
    const roles = g.roles.cache.size;
    const channels = g.channels.cache.size;
    const members = g.memberCount;
    const owner = await g.fetchOwner().catch(() => null);
    const createdAt = g.createdAt.toLocaleDateString();
    return { message: `📋 **${g.name}**\n👑 Owner: ${owner?.user?.tag || 'Unknown'}\n👥 Members: ${members}\n📁 Channels: ${channels}\n🏷️ Roles: ${roles}\n📅 Created: ${createdAt}\n🆔 ID: ${g.id}` };
  }
}

class UserInfo extends Tool {
  constructor() {
    super();
    this.name = 'userInfo';
    this.description = 'Get information about a user';
    this.parameters = {
      userId: { type: 'string', description: 'User ID or mention (defaults to yourself)' },
    };
    this.required = [];
    this.dangerous = false;
    this.category = 'information';
  }

  async execute(context, args) {
    const g = context.guild?.botMember?.guild;
    if (!g) return { message: 'This command must be used in a server.' };
    const targetId = args.userId || context.userId;
    const member = await g.members.fetch(targetId).catch(() => null);
    if (!member) return { message: '❌ User not found.' };
    const roles = member.roles.cache.filter(r => r.id !== g.id).map(r => r.name).join(', ') || 'None';
    return { message: `👤 **${member.user.tag}**\n🆔 ${member.id}\n📅 Joined: ${member.joinedAt?.toLocaleDateString() || 'Unknown'}\n👑 Admin: ${member.permissions.has('Administrator') ? 'Yes' : 'No'}\n🏷️ Roles: ${roles}` };
  }
}

class RoleInfo extends Tool {
  constructor() {
    super();
    this.name = 'roleInfo';
    this.description = 'Get information about a role';
    this.parameters = {
      roleId: { type: 'string', description: 'Role ID or name' },
    };
    this.required = ['roleId'];
    this.dangerous = false;
    this.category = 'information';
  }

  async execute(context, args) {
    const g = context.guild?.botMember?.guild;
    if (!g) return { message: 'This command must be used in a server.' };
    const role = g.roles.cache.get(args.roleId) || g.roles.cache.find(r => r.name.toLowerCase() === args.roleId.toLowerCase());
    if (!role) return { message: '❌ Role not found.' };
    const color = role.hexColor === '#000000' ? 'None' : role.hexColor;
    return { message: `🏷️ **${role.name}**\n🆔 ${role.id}\n🎨 Color: ${color}\n👥 Members: ${role.members.size}\n📌 Display separately: ${role.hoist ? 'Yes' : 'No'}\n🔝 Position: ${role.position}` };
  }
}

class ListRoles extends Tool {
  constructor() {
    super();
    this.name = 'listRoles';
    this.description = 'List all roles in the server';
    this.parameters = {};
    this.required = [];
    this.dangerous = false;
    this.category = 'information';
  }

  async execute(context) {
    const g = context.guild?.botMember?.guild;
    if (!g) return { message: 'This command must be used in a server.' };
    const roles = g.roles.cache.filter(r => r.id !== g.id).sort((a, b) => b.position - a.position).map(r => `${r.name} (${r.members.size})`).join('\n') || 'None';
    return { message: `**Roles (${g.roles.cache.size - 1}):**\n${roles}` };
  }
}

class ListChannels extends Tool {
  constructor() {
    super();
    this.name = 'listChannels';
    this.description = 'List all channels in the server';
    this.parameters = {};
    this.required = [];
    this.dangerous = false;
    this.category = 'information';
  }

  async execute(context) {
    const g = context.guild?.botMember?.guild;
    if (!g) return { message: 'This command must be used in a server.' };
    const { ChannelType } = await import('discord.js');
    const cats = g.channels.cache.filter(c => c.type === ChannelType.GuildCategory).sort((a, b) => a.position - b.position);
    let txt = `**Channels (${g.channels.cache.size}):**\n`;
    for (const cat of cats.values()) {
      txt += `\n📁 **${cat.name}**\n`;
      const children = g.channels.cache.filter(c => c.parentId === cat.id).sort((a, b) => a.position - b.position);
      for (const ch of children.values()) {
        const icon = ch.type === ChannelType.GuildVoice ? '🔊' : ch.type === ChannelType.GuildAnnouncement ? '📢' : '💬';
        txt += `${icon} ${ch.name}\n`;
      }
    }
    const uncategorized = g.channels.cache.filter(c => !c.parentId && c.type !== ChannelType.GuildCategory).sort((a, b) => a.position - b.position);
    if (uncategorized.size > 0) {
      txt += '\n**Uncategorized:**\n';
      for (const ch of uncategorized.values()) {
        txt += `💬 ${ch.name}\n`;
      }
    }
    return { message: txt };
  }
}

export function registerInformationTools(registry) {
  for (const tool of [new ServerInfo(), new UserInfo(), new RoleInfo(), new ListRoles(), new ListChannels()]) {
    registry.register(tool);
  }
}
