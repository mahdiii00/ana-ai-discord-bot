import mongoose from 'mongoose';
import { config } from './config.js';

export async function connectDB() {
  try {
    await mongoose.connect(config.mongodb.uri);
    console.log('[DB] MongoDB connected');
  } catch (error) {
    console.error('[DB] Connection failed:', error.message);
    process.exit(1);
  }
}
