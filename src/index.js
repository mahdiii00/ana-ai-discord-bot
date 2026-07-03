import { Client, GatewayIntentBits, REST, Routes, Events } from 'discord.js';
import { config, validateConfig } from './config/index.js';
import { adminCommand } from './commands/slash/admin.js';
import { handleSlashCommand } from './events/interactionCreate.js';
import { handleMessage } from './events/messageCreate.js';

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
  ],
});

client.once(Events.ClientReady, async (c) => {
  console.log(`Logged in as ${c.user.tag}`);

  try {
    const rest = new REST({ version: '10' }).setToken(config.discord.token);
    await rest.put(
      Routes.applicationCommands(c.user.id),
      { body: [adminCommand.toJSON()] },
    );
    console.log('Slash commands registered globally.');
  } catch (error) {
    console.error('Failed to register slash commands:', error);
  }
});

client.on(Events.InteractionCreate, handleSlashCommand);
client.on(Events.MessageCreate, handleMessage);

client.login(config.discord.token).catch((err) => {
  console.error('Failed to login:', err.message);
  process.exit(1);
});
