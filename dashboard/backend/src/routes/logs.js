import { Router } from 'express';
import { requireAuth, requireGuildAccess } from '../middleware/auth.js';
import { AuditLog } from '../models/AuditLog.js';

const router = Router();

router.get('/:guildId', requireAuth, requireGuildAccess, async (req, res) => {
  try {
    const { limit = 100, offset = 0, action, severity } = req.query;
    const query = { guildId: req.params.guildId };
    if (action) query.action = action;
    if (severity) query.severity = severity;

    const logs = await AuditLog.find(query)
      .sort({ timestamp: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    const total = await AuditLog.countDocuments(query);
    res.json({ logs, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:guildId/stats', requireAuth, requireGuildAccess, async (req, res) => {
  try {
    const guildId = req.params.guildId;
    const now = new Date();
    const dayAgo = new Date(now - 86400000);
    const weekAgo = new Date(now - 7 * 86400000);

    const [recent, weekly, actions] = await Promise.all([
      AuditLog.countDocuments({ guildId, timestamp: { $gte: dayAgo } }),
      AuditLog.countDocuments({ guildId, timestamp: { $gte: weekAgo } }),
      AuditLog.aggregate([
        { $match: { guildId } },
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    res.json({ stats: { last24h: recent, last7d: weekly, topActions: actions } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
