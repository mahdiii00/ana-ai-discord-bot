import { SlashCommandBuilder } from 'discord.js';

export const adminCommand = new SlashCommandBuilder()
  .setName('admin')
  .setDescription('Execute an AI-powered server management command')
  .addStringOption(option =>
    option
      .setName('command')
      .setDescription('Your command in natural language (Darija, Arabic, French, or English)')
      .setRequired(true)
      .setMaxLength(500)
  );
