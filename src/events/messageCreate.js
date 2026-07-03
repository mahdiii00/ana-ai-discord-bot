import { config } from '../config/index.js';
import { parseIntent } from '../ai/intentParser.js';
import { checkPermissions, isDangerousAction } from '../services/permissionService.js';
import { askConfirmation } from '../services/confirmationService.js';
import { executeAction } from '../services/actionService.js';
import { addMessage, getContext } from '../services/memoryService.js';

export async function handleMessage(message) {
  if (message.author.bot) return;
  if (!message.guild) return;

  addMessage(message.channel.id, message.author.username, message.content);

  const prefix = config.discord.prefix;
  if (!message.content.startsWith(prefix)) return;

  const input = message.content.slice(prefix.length).trim();
  if (!input) return;

  message.channel.sendTyping();

  const context = getContext(message.channel.id, 6);
  const intent = await parseIntent(input, message.author.tag, context);

  if (intent.action === 'unknown') {
    return message.reply({
      content: `🤖 ${intent.message || 'Rephrase that?'}`,
    });
  }

  const permCheck = checkPermissions(message.member, intent.action);
  if (!permCheck.allowed) {
    return message.reply({
      content: `❌ Need **${permCheck.missing.join(', ')}**.`,
    });
  }

  let replyMessage;
  if (isDangerousAction(intent.action)) {
    const result = await askConfirmation(message, `Execute \`${intent.action}\`?`);
    if (!result.confirmed) return;
    replyMessage = result.replyMessage;
    await replyMessage.edit({ content: '⏳ Doing it...' });
  } else {
    replyMessage = await message.reply({ content: '⏳ Doing it...' });
  }

  intent.sourceChannelId = message.channel.id;
  const result = await executeAction(message.guild, message.member, intent);

  await replyMessage.edit({
    content: result.success
      ? `✅ ${result.message}`
      : `❌ ${result.message}`,
  });
}
