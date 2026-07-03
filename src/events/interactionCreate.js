import { parseIntent } from '../ai/intentParser.js';
import { checkPermissions, isDangerousAction } from '../services/permissionService.js';
import { askConfirmation } from '../services/confirmationService.js';
import { executeAction } from '../services/actionService.js';
import { addMessage, getContext } from '../services/memoryService.js';

export async function handleSlashCommand(interaction) {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== 'admin') return;

  await interaction.deferReply({ ephemeral: false });

  const input = interaction.options.getString('command', true);
  const guild = interaction.guild;
  const member = interaction.member;

  addMessage(interaction.channelId, member.user.username, `/admin ${input}`);
  const context = getContext(interaction.channelId, 6);
  const intent = await parseIntent(input, member.user.tag, context);

  if (intent.action === 'unknown') {
    return interaction.editReply({
      content: `🤖 ${intent.message || 'Rephrase that?'}`,
    });
  }

  const permCheck = checkPermissions(member, intent.action);
  if (!permCheck.allowed) {
    return interaction.editReply({
      content: `❌ Need **${permCheck.missing.join(', ')}**.`,
    });
  }

  if (isDangerousAction(intent.action)) {
    const { confirmed } = await askConfirmation(interaction, `Execute \`${intent.action}\`?`);
    if (!confirmed) return;
  } else {
    await interaction.editReply({ content: '⏳ Doing it...' });
  }

  intent.sourceChannelId = interaction.channelId;
  const result = await executeAction(guild, member, intent);

  await interaction.editReply({
    content: result.success
      ? `✅ ${result.message}`
      : `❌ ${result.message}`,
  });
}
