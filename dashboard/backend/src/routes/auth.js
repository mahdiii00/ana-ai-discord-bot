import { Router } from 'express';
import axios from 'axios';
import { config } from '../config.js';
import { User } from '../models/User.js';

const router = Router();

router.get('/discord', (req, res) => {
  const url = 'https://discord.com/api/oauth2/authorize' +
    `?client_id=${config.discord.clientId}` +
    `&redirect_uri=${encodeURIComponent(config.discord.redirectUri)}` +
    '&response_type=code' +
    '&scope=identify+guilds';
  res.redirect(url);
});

router.get('/discord/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.redirect(`${config.frontend.url}/login?error=no_code`);

    const tokenRes = await axios.post('https://discord.com/api/oauth2/token',
      new URLSearchParams({
        client_id: config.discord.clientId,
        client_secret: config.discord.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: config.discord.redirectUri,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const { access_token, refresh_token } = tokenRes.data;
    const userRes = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const { id, username, global_name, avatar } = userRes.data;

    const guildsRes = await axios.get('https://discord.com/api/users/@me/guilds', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    let user = await User.findOne({ discordId: id });
    if (user) {
      user.username = username;
      user.globalName = global_name;
      user.avatar = avatar;
      user.accessToken = access_token;
      user.refreshToken = refresh_token;
      await user.save();
    } else {
      user = await User.create({
        discordId: id, username, globalName: global_name,
        avatar, accessToken: access_token, refreshToken: refresh_token,
      });
    }

    req.session.user = {
      ...user.toPublic(),
      guilds: guildsRes.data,
    };

    res.redirect(`${config.frontend.url}/servers`);
  } catch (error) {
    console.error('[Auth] OAuth error:', error.response?.data || error.message);
    res.redirect(`${config.frontend.url}/login?error=auth_failed`);
  }
});

router.get('/me', (req, res) => {
  if (!req.session?.user) return res.json({ user: null });
  res.json({ user: req.session.user });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

export default router;
