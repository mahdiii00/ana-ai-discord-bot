import { config } from '../config/index.js';

export class ContextManager {
  constructor() {
    this.pendingConfirmations = new Map();
  }

  buildContext(message, conversationMemory, persistentMemory) {
    const member = message.member;
    const isAdmin = member?.permissions?.has('Administrator') || false;
    const hasAdminRole = config.discord.adminRoleIds?.length > 0 &&
      member?.roles?.cache?.some(r => config.discord.adminRoleIds.includes(r.id)) || false;

    return {
      userId: message.author.id,
      username: message.author.username,
      displayName: member?.displayName || message.author.username,
      isAdmin: isAdmin || hasAdminRole,
      guild: message.guild ? {
        id: message.guild.id,
        name: message.guild.name,
        memberCount: message.guild.memberCount,
        botMember: message.guild.members?.me || null,
      } : null,
      channel: {
        id: message.channel.id,
        name: message.channel.name,
        type: message.channel.type,
      },
      conversationHistory: conversationMemory.getRecent(message.author.id),
      userMemories: persistentMemory.getUserMemories(message.author.id),
      userPhrases: persistentMemory.getUserPhrases(message.author.id),
    };
  }

  getPending(userId) {
    const entry = this.pendingConfirmations.get(userId);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > 300000) {
      this.pendingConfirmations.delete(userId);
      return null;
    }
    return entry;
  }

  setPending(userId, data) {
    this.pendingConfirmations.set(userId, { ...data, timestamp: Date.now() });
  }

  clearPending(userId) {
    this.pendingConfirmations.delete(userId);
  }
}
