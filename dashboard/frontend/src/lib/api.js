const API = import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    if (res.status === 401) { window.location.href = '/login'; return null; }
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  auth: {
    me: () => request('/auth/me'),
    logout: () => request('/auth/logout', { method: 'POST' }),
    login: () => { window.location.href = `${API}/auth/discord`; },
  },
  guilds: {
    list: () => request('/guilds'),
    get: (id) => request(`/guilds/${id}`),
  },
  config: {
    get: (guildId) => request(`/config/${guildId}`),
    update: (guildId, data) => request(`/config/${guildId}`, { method: 'PUT', body: JSON.stringify(data) }),
    toggleSecurity: (guildId, module, enabled) =>
      request(`/config/${guildId}/security`, { method: 'PUT', body: JSON.stringify({ module, enabled }) }),
    whitelist: (guildId, userId, action) =>
      request(`/config/${guildId}/whitelist`, { method: 'PUT', body: JSON.stringify({ userId, action }) }),
    blacklist: (guildId, userId, action) =>
      request(`/config/${guildId}/blacklist`, { method: 'PUT', body: JSON.stringify({ userId, action }) }),
  },
  logs: {
    list: (guildId, params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/logs/${guildId}${q ? '?' + q : ''}`);
    },
    stats: (guildId) => request(`/logs/${guildId}/stats`),
  },
  tickets: {
    list: (guildId) => request(`/tickets/${guildId}`),
    updateStatus: (guildId, ticketId, status) =>
      request(`/tickets/${guildId}/${ticketId}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  },
  backups: {
    list: (guildId) => request(`/backups/${guildId}`),
    get: (guildId, filename) => request(`/backups/${guildId}/${filename}`),
  },
  analytics: {
    get: (guildId, days = 7) => request(`/analytics/${guildId}?days=${days}`),
  },
};
