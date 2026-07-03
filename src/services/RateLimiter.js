export class RateLimiter {
  constructor(cooldownMs = 2000, maxPerMinute = 10) {
    this.cooldownMs = cooldownMs;
    this.maxPerMinute = maxPerMinute;
    this.lastMessage = new Map();
    this.minuteCounts = new Map();
    this._cleanupInterval = setInterval(() => this._cleanup(), 300000);
  }

  _cleanup() {
    const cutoff = Date.now() - 120000;
    for (const [key, time] of this.lastMessage) {
      if (time < cutoff) this.lastMessage.delete(key);
    }
    const windowStart = Date.now() - 60000;
    for (const [key, times] of this.minuteCounts) {
      const filtered = times.filter(t => t > windowStart);
      if (filtered.length === 0) this.minuteCounts.delete(key);
      else this.minuteCounts.set(key, filtered);
    }
  }

  destroy() {
    clearInterval(this._cleanupInterval);
    this.lastMessage.clear();
    this.minuteCounts.clear();
  }

  check(userId) {
    const now = Date.now();
    const last = this.lastMessage.get(userId) || 0;
    if (now - last < this.cooldownMs) return false;
    this.lastMessage.set(userId, now);

    let counts = this.minuteCounts.get(userId) || [];
    counts = counts.filter(t => t > now - 60000);
    counts.push(now);
    this.minuteCounts.set(userId, counts);

    return counts.length <= this.maxPerMinute;
  }
}
