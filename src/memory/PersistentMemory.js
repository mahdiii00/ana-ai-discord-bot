import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../memory_data');

export class PersistentMemory {
  constructor() {
    if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });
    this._cache = new Map();
  }

  _fp(userId) {
    return path.join(DIR, `${userId}.json`);
  }

  async _load(userId) {
    const cached = this._cache.get(userId);
    if (cached) return cached;
    const fp = this._fp(userId);
    try {
      const data = JSON.parse(await fs.promises.readFile(fp, 'utf-8'));
      this._cache.set(userId, data);
      return data;
    } catch {
      const data = { memories: [], phrases: {} };
      this._cache.set(userId, data);
      return data;
    }
  }

  async _save(userId) {
    const data = this._cache.get(userId);
    if (!data) return;
    await fs.promises.writeFile(this._fp(userId), JSON.stringify(data));
  }

  async addMemory(userId, text) {
    const data = await this._load(userId);
    data.memories.push({ text, timestamp: Date.now() });
    if (data.memories.length > 50) data.memories.shift();
    await this._save(userId);
  }

  async getUserMemories(userId) {
    const data = await this._load(userId);
    return data.memories.map(m => m.text);
  }

  async learnPhrase(userId, phrase, meaning) {
    const data = await this._load(userId);
    data.phrases[phrase.toLowerCase().trim()] = meaning;
    await this._save(userId);
  }

  async getPhrase(userId, phrase) {
    const data = await this._load(userId);
    return data.phrases[phrase.toLowerCase().trim()] || null;
  }

  async getUserPhrases(userId) {
    const data = await this._load(userId);
    return Object.entries(data.phrases).map(([k, v]) => `"${k}" means "${v}"`);
  }
}
