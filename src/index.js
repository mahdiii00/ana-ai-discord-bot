import { Client, GatewayIntentBits, REST, Routes, Events } from 'discord.js';
import { config, validateConfig } from './config/index.js';
import { adminCommand } from './commands/slash/admin.js';
import { securityCommand, handleSecurityCommand } from './commands/slash/security.js';
import { handleSlashCommand, setAgent as setInteractionAgent } from './events/interactionCreate.js';
import { handleMessage, setAgent as setMessageAgent } from './events/messageCreate.js';
import { handleGuildMemberAdd } from './events/guildMemberAdd.js';
import { handleGuildMemberRemove } from './events/guildMemberRemove.js';
import { handleMessageDelete } from './events/messageDelete.js';
import { handleMessageUpdate } from './events/messageUpdate.js';
import { handleChannelCreate } from './events/channelCreate.js';
import { handleChannelDelete } from './events/channelDelete.js';
import { handleChannelUpdate } from './events/channelUpdate.js';
import { handleGuildMemberUpdate } from './events/guildMemberUpdate.js';
import { handleVoiceStateUpdate } from './events/voiceStateUpdate.js';
import { dailyBackup } from './security/backupManager.js';
import { connectAuditDB, persistGuildConfig } from './services/auditStore.js';
import { Agent } from './core/Agent.js';

const missing = validateConfig();
if (missing.length > 0) {
  console.error(`Missing required env vars: ${missing.join(', ')}`);
  console.error('Edit .env and fill in the values.');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildIntegrations,
  ],
});

const agent = new Agent();
setMessageAgent(agent);
setInteractionAgent(agent);

if (config.mongodb?.uri) {
  await connectAuditDB(config.mongodb.uri);
}

client.once(Events.ClientReady, async (c) => {
  console.log(`Logged in as ${c.user.tag}`);
  console.log(`[Agent] ${agent.getToolCount()} tools loaded`);

  try {
    const rest = new REST({ version: '10' }).setToken(config.discord.token);
    await rest.put(
      Routes.applicationCommands(c.user.id),
      { body: [adminCommand.toJSON(), securityCommand.toJSON()] },
    );
    console.log('Slash commands registered globally.');
  } catch (error) {
    console.error('Failed to register slash commands:', error);
  }

  console.log('[Backup] Scheduling daily backup...');
  const runDaily = async () => {
    await dailyBackup(client);
  };
  setTimeout(runDaily, 30000);
  setInterval(runDaily, 24 * 60 * 60 * 1000);
});

client.on(Events.InteractionCreate, (i) => {
  if (i.isChatInputCommand() && i.commandName === 'security') {
    handleSecurityCommand(i);
  } else {
    handleSlashCommand(i);
  }
});

client.on(Events.MessageCreate, handleMessage);

client.on(Events.GuildMemberAdd, handleGuildMemberAdd);
client.on(Events.GuildMemberRemove, handleGuildMemberRemove);
client.on(Events.GuildMemberUpdate, handleGuildMemberUpdate);

client.on(Events.MessageDelete, handleMessageDelete);
client.on(Events.MessageUpdate, handleMessageUpdate);

client.on(Events.ChannelCreate, handleChannelCreate);
client.on(Events.ChannelDelete, handleChannelDelete);
client.on(Events.ChannelUpdate, handleChannelUpdate);

client.on(Events.VoiceStateUpdate, handleVoiceStateUpdate);

client.login(config.discord.token).catch((err) => {
  console.error('Failed to login:', err.message);
  process.exit(1);
});
