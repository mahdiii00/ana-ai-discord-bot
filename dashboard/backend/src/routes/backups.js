import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { requireAuth, requireGuildAccess } from '../middleware/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKUP_DIR = path.resolve(__dirname, '../../../../backups');

function getGuildBackups(guildId) {
  const dir = path.join(BACKUP_DIR, guildId);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8'));
      return {
        filename: f,
        timestamp: data.timestamp,
        roles: data.roles?.length || 0,
        channels: data.channels?.length || 0,
        categories: data.categories?.length || 0,
      };
    })
    .sort((a, b) => b.timestamp - a.timestamp);
}

const router = Router();

router.get('/:guildId', requireAuth, requireGuildAccess, (req, res) => {
  try {
    const backups = getGuildBackups(req.params.guildId);
    res.json({ backups });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:guildId/:filename', requireAuth, requireGuildAccess, (req, res) => {
  try {
    const filePath = path.join(BACKUP_DIR, req.params.guildId, req.params.filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Backup not found' });
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    res.json({ backup: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
