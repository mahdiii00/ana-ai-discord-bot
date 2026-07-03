export class ConversationMemory {
  constructor(maxPerUser = 30) {
    this.sessions = new Map();
    this.maxPerUser = maxPerUser;
    this._cleanupInterval = setInterval(() => this._cleanup(), 3600000);
  }

  destroy() {
    clearInterval(this._cleanupInterval);
    this.sessions.clear();
  }

  _cleanup() {
    const cutoff = Date.now() - 4 * 60 * 60 * 1000;
    for (const [userId, session] of this.sessions) {
      if (session.length === 0) { this.sessions.delete(userId); continue; }
      const last = session[session.length - 1];
      if (last.timestamp < cutoff) this.sessions.delete(userId);
    }
  }

  add(userId, role, content) {
    if (!this.sessions.has(userId)) {
      this.sessions.set(userId, []);
    }
    const session = this.sessions.get(userId);
    session.push({ role, content, timestamp: Date.now() });
    if (session.length > this.maxPerUser) {
      session.splice(0, session.length - this.maxPerUser);
    }
  }

  getRecent(userId, count = 10) {
    const session = this.sessions.get(userId);
    if (!session) return [];
    return session.slice(-count);
  }

  clear(userId) {
    this.sessions.delete(userId);
  }
}
