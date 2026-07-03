export function requireAuth(req, res, next) {
  if (!req.session?.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
}

export function requireGuildAccess(req, res, next) {
  const guildId = req.params.guildId || req.body.guildId;
  if (!guildId) return res.status(400).json({ error: 'No guild ID' });
  if (!req.session.user.guilds?.some(g => g.id === guildId)) {
    return res.status(403).json({ error: 'No access to this guild' });
  }
  next();
}
