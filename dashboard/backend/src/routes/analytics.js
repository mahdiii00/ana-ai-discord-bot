import { Router } from 'express';
import { requireAuth, requireGuildAccess } from '../middleware/auth.js';
import { Guild } from '../models/Guild.js';
import { AuditLog } from '../models/AuditLog.js';
import { Ticket } from '../models/Ticket.js';

const router = Router();

router.get('/:guildId', requireAuth, requireGuildAccess, async (req, res) => {
  try {
    const guildId = req.params.guildId;
    const guild = await Guild.findOne({ guildId });

    const now = new Date();
    const days = parseInt(req.query.days || '7');
    const since = new Date(now - days * 86400000);

    const [logCount, ticketStats, logTimeline] = await Promise.all([
      AuditLog.countDocuments({ guildId, timestamp: { $gte: since } }),
      Ticket.aggregate([
        { $match: { guildId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      AuditLog.aggregate([
        { $match: { guildId, timestamp: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const ticketMap = { open: 0, closed: 0, pending: 0 };
    ticketStats.forEach(t => { ticketMap[t._id] = t.count; });

    res.json({
      analytics: {
        totalActions: logCount,
        tickets: ticketMap,
        timeline: logTimeline.map(t => ({ date: t._id, count: t.count })),
        config: guild?.config || {},
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
