import { Router } from 'express';
import { requireAuth, requireGuildAccess } from '../middleware/auth.js';
import { Ticket } from '../models/Ticket.js';

const router = Router();

router.get('/:guildId', requireAuth, requireGuildAccess, async (req, res) => {
  try {
    const tickets = await Ticket.find({ guildId: req.params.guildId }).sort({ createdAt: -1 }).limit(50);
    res.json({ tickets });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:guildId/:ticketId/status', requireAuth, requireGuildAccess, async (req, res) => {
  try {
    const { status } = req.body;
    const update = { status };
    if (status === 'closed') {
      update.closedBy = req.session.user.id;
      update.closedAt = new Date();
    }
    const ticket = await Ticket.findOneAndUpdate(
      { _id: req.params.ticketId, guildId: req.params.guildId },
      update,
      { new: true }
    );
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    res.json({ ticket });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
