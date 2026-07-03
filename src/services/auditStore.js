let mongoose = null;
let AuditLogModel = null;
let connected = false;

const AUDIT_LOG_SCHEMA_DEF = {
  guildId: { type: String, required: true, index: true },
  action: { type: String, required: true },
  executor: { type: String },
  executorId: { type: String },
  details: { type: Object },
  severity: { type: String, enum: ['info', 'warn', 'high'], default: 'info' },
  timestamp: { type: Date, default: Date.now },
};

export async function connectAuditDB(uri) {
  if (connected) return;
  if (!uri) return;
  try {
    mongoose = (await import('mongoose')).default;
    const schema = new mongoose.Schema(AUDIT_LOG_SCHEMA_DEF);
    schema.index({ guildId: 1, timestamp: -1 });
    AuditLogModel = mongoose.model('AuditLog', schema);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000, socketTimeoutMS: 45000 });
    connected = true;
    console.log('[AuditStore] MongoDB connected');
  } catch (error) {
    console.error('[AuditStore] Failed to connect:', error.message);
  }
}

export async function persistAuditLog(guildId, action, details = {}, executor = 'system', executorId = '', severity = 'info') {
  if (!connected || !AuditLogModel) return;
  try {
    await AuditLogModel.create({ guildId, action, details, executor, executorId, severity, timestamp: new Date() });
  } catch (error) {
    console.error('[AuditStore] Failed to persist:', error.message);
  }
}

export async function persistGuildConfig(guildId, name, icon, configData) {
  if (!connected || !mongoose) return;
  try {
    const GuildConfig = mongoose.models.GuildConfig || mongoose.model('GuildConfig', new mongoose.Schema({
      guildId: { type: String, required: true, unique: true },
      name: String,
      icon: String,
      config: { type: Object, default: {} },
    }, { timestamps: true }));
    await GuildConfig.findOneAndUpdate(
      { guildId },
      { guildId, name, icon, config: configData },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error('[AuditStore] Failed to persist guild config:', error.message);
  }
}

export function isAuditDBConnected() {
  return connected;
}
