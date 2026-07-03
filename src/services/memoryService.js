const channelMemory = new Map();
const MAX_MESSAGES = 30;

export function addMessage(channelId, username, content) {
  if (!channelMemory.has(channelId)) {
    channelMemory.set(channelId, []);
  }
  const history = channelMemory.get(channelId);
  history.push({ username, content, timestamp: Date.now() });
  if (history.length > MAX_MESSAGES) history.shift();
}

export function getContext(channelId, maxMessages = 10) {
  const history = channelMemory.get(channelId);
  if (!history || history.length === 0) return '';
  const recent = history.slice(-maxMessages);
  return recent.map(m => `${m.username}: ${m.content}`).join('\n');
}
