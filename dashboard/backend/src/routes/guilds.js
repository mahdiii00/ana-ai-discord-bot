import { Router } from 'express';
import axios from 'axios';
import { requireAuth } from '../middleware/auth.js';
import { Guild } from '../models/Guild.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const userGuilds = req.session.user.guilds || [];
    const managed = await Guild.find({ guildId: { $in: userGuilds.map(g => g.id) } });
    const managedIds = new Set(managed.map(g => g.guildId));

    const result = userGuilds
      .filter(g => (g.permissions & 0x20) === 0x20)
      .map(g => ({
        id: g.id,
        name: g.name,
        icon: g.icon,
        owner: g.owner,
        hasBot: managedIds.has(g.id),
        config: managed.find(m => m.guildId === g.id)?.config || null,
      }));

    res.json({ guilds: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:guildId', requireAuth, async (req, res) => {
  try {
    const { guildId } = req.params;
    const guild = await Guild.findOne({ guildId });
    if (!guild) return res.json({ guild: null });
    res.json({ guild: guild.toPublic() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
