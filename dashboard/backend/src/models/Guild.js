import mongoose from 'mongoose';

const guildConfigSchema = new mongoose.Schema({
  prefix: { type: String, default: 'ai' },
  language: { type: String, default: 'auto' },
  logChannelId: { type: String, default: null },
  adminRoleIds: [{ type: String }],
  antiSpam: { type: Boolean, default: true },
  antiLink: { type: Boolean, default: true },
  antiBot: { type: Boolean, default: true },
  antiScam: { type: Boolean, default: true },
  antiRaid: { type: Boolean, default: true },
  antiNuke: { type: Boolean, default: true },
  autoMod: { type: Boolean, default: false },
  autoBackup: { type: Boolean, default: true },
  aiModel: { type: String, default: 'llama-3.3-70b-versatile' },
  aiTemperature: { type: Number, default: 0.1 },
  whitelist: [{ type: String }],
  blacklist: [{ type: String }],
}, { _id: false });

const guildSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  icon: { type: String },
  ownerId: { type: String },
  memberCount: { type: Number, default: 0 },
  botInGuild: { type: Boolean, default: true },
  config: { type: guildConfigSchema, default: () => ({}) },
}, { timestamps: true });

guildSchema.methods.toPublic = function () {
  return {
    id: this.guildId,
    name: this.name,
    icon: this.icon,
    ownerId: this.ownerId,
    memberCount: this.memberCount,
    botInGuild: this.botInGuild,
    config: this.config,
  };
};

export const Guild = mongoose.model('Guild', guildSchema);
