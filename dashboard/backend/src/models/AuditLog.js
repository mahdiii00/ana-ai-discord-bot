import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  guildId: { type: String, required: true, index: true },
  action: { type: String, required: true },
  executor: { type: String },
  executorId: { type: String },
  details: { type: mongoose.Schema.Types.Mixed },
  severity: { type: String, enum: ['info', 'warn', 'high'], default: 'info' },
  timestamp: { type: Date, default: Date.now },
});

auditLogSchema.index({ guildId: 1, timestamp: -1 });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
