import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  guildId: { type: String, required: true, index: true },
  channelId: { type: String, required: true },
  userId: { type: String, required: true },
  userName: { type: String },
  status: { type: String, enum: ['open', 'closed', 'pending'], default: 'open' },
  subject: { type: String, default: '' },
  messages: [{
    author: String,
    content: String,
    timestamp: { type: Date, default: Date.now },
  }],
  closedBy: { type: String },
  closedAt: { type: Date },
}, { timestamps: true });

export const Ticket = mongoose.model('Ticket', ticketSchema);
