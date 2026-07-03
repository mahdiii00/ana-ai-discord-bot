import { createBackup, listBackups } from '../security/backupManager.js';
import { isPanicMode, enablePanicMode, disablePanicMode } from '../security/panicMode.js';
import { analyzeAuditLogs } from '../security/auditAnalyzer.js';
import { addWhitelist, removeWhitelist, addBlacklist, removeBlacklist } from '../security/whitelistBlacklist.js';

const agentRef = { current: null };

export function setAgent(agent) {
  agentRef.current = agent;
}

export async function handleSlashCommand(interaction) {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'admin') {
    await interaction.deferReply();
    const input = interaction.options.getString('command', true);

    const agent = agentRef.current;
    if (!agent) return interaction.editReply('Bot agent not initialized.');

    const fakeMessage = {
      author: {
        id: interaction.user.id,
        username: interaction.user.username,
        bot: false,
      },
      member: interaction.member,
      guild: interaction.guild,
      channel: interaction.channel,
      client: interaction.client,
      content: input,
      reply: (content) => {
        if (typeof content === 'string') content = { content };
        return interaction.editReply(content);
      },
    };

    const reply = await agent.processMessage(fakeMessage);
    if (reply) interaction.editReply(reply);
  }
}
