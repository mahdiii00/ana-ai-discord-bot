import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  discordId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  globalName: { type: String },
  avatar: { type: String },
  accessToken: { type: String },
  refreshToken: { type: String },
  isAdmin: { type: Boolean, default: false },
}, { timestamps: true });

userSchema.methods.toPublic = function () {
  return {
    id: this.discordId,
    username: this.username,
    globalName: this.globalName,
    avatar: this.avatar,
    isAdmin: this.isAdmin,
  };
};

export const User = mongoose.model('User', userSchema);
