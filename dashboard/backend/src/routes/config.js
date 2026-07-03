import { Router } from 'express';
import { requireAuth, requireGuildAccess } from '../middleware/auth.js';
import { Guild } from '../models/Guild.js';

const router = Router();

router.get('/:guildId', requireAuth, requireGuildAccess, async (req, res) => {
  try {
    const guild = await Guild.findOne({ guildId: req.params.guildId });
    if (!guild) return res.json({ config: null });
    res.json({ config: guild.config });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:guildId', requireAuth, requireGuildAccess, async (req, res) => {
  try {
    const guild = await Guild.findOne({ guildId: req.params.guildId });
    if (!guild) return res.status(404).json({ error: 'Guild not found' });
    Object.assign(guild.config, req.body);
    await guild.save();
    res.json({ config: guild.config });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:guildId/security', requireAuth, requireGuildAccess, async (req, res) => {
  try {
    const guild = await Guild.findOne({ guildId: req.params.guildId });
    if (!guild) return res.status(404).json({ error: 'Guild not found' });
    const { module, enabled } = req.body;
    const validModules = ['antiSpam', 'antiLink', 'antiBot', 'antiScam', 'antiRaid', 'antiNuke', 'autoMod', 'autoBackup'];
    if (!validModules.includes(module)) return res.status(400).json({ error: 'Invalid module' });
    guild.config[module] = enabled;
    await guild.save();
    res.json({ config: guild.config });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:guildId/whitelist', requireAuth, requireGuildAccess, async (req, res) => {
  try {
    const guild = await Guild.findOne({ guildId: req.params.guildId });
    if (!guild) return res.status(404).json({ error: 'Guild not found' });
    const { userId, action } = req.body;
    if (action === 'add') {
      if (!guild.config.whitelist.includes(userId)) guild.config.whitelist.push(userId);
    } else if (action === 'remove') {
      guild.config.whitelist = guild.config.whitelist.filter(id => id !== userId);
    }
    await guild.save();
    res.json({ whitelist: guild.config.whitelist });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:guildId/blacklist', requireAuth, requireGuildAccess, async (req, res) => {
  try {
    const guild = await Guild.findOne({ guildId: req.params.guildId });
    if (!guild) return res.status(404).json({ error: 'Guild not found' });
    const { userId, action } = req.body;
    if (action === 'add') {
      if (!guild.config.blacklist.includes(userId)) guild.config.blacklist.push(userId);
    } else if (action === 'remove') {
      guild.config.blacklist = guild.config.blacklist.filter(id => id !== userId);
    }
    await guild.save();
    res.json({ blacklist: guild.config.blacklist });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
