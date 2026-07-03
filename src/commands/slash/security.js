import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getGuildConfig } from '../../store/guildConfig.js';
import { isPanicMode, enablePanicMode, disablePanicMode } from '../../security/panicMode.js';
import { isRaidMode } from '../../security/antiRaid.js';
import { listBackups } from '../../security/backupManager.js';
import { analyzeAuditLogs } from '../../security/auditAnalyzer.js';
import { isWhitelisted, isBlacklisted, addWhitelist, removeWhitelist, addBlacklist, removeBlacklist } from '../../security/whitelistBlacklist.js';
import { logSecurityAction } from '../../services/loggingService.js';

export const securityCommand = new SlashCommandBuilder()
  .setName('security')
  .setDescription('Security dashboard and management')
  .addSubcommand(sub => sub.setName('dashboard').setDescription('View security status'))
  .addSubcommand(sub => sub.setName('panic').setDescription('Enable panic mode - locks server'))
  .addSubcommand(sub => sub.setName('unlock').setDescription('Disable panic mode'))
  .addSubcommand(sub => sub.setName('audit').setDescription('Analyze audit logs'))
  .addSubcommand(sub => sub.setName('backups').setDescription('List recent backups'))
  .addSubcommand(sub =>
    sub.setName('whitelist_add')
      .setDescription('Add a user to the whitelist')
      .addUserOption(o => o.setName('user').setDescription('User to whitelist').setRequired(true)))
  .addSubcommand(sub =>
    sub.setName('whitelist_remove')
      .setDescription('Remove a user from the whitelist')
      .addUserOption(o => o.setName('user').setDescription('User to remove').setRequired(true)))
  .addSubcommand(sub =>
    sub.setName('whitelist_list')
      .setDescription('List whitelisted users'))
  .addSubcommand(sub =>
    sub.setName('blacklist_add')
      .setDescription('Add a user to the blacklist')
      .addUserOption(o => o.setName('user').setDescription('User to blacklist').setRequired(true)))
  .addSubcommand(sub =>
    sub.setName('blacklist_remove')
      .setDescription('Remove a user from the blacklist')
      .addUserOption(o => o.setName('user').setDescription('User to remove').setRequired(true)))
  .addSubcommand(sub =>
    sub.setName('blacklist_list')
      .setDescription('List blacklisted users'));

export async function handleSecurityCommand(interaction) {
  const sub = interaction.options.getSubcommand();
  const guild = interaction.guild;
  const member = interaction.member;

  if (!member.permissions.has('Administrator')) {
    return interaction.reply({ content: '❌ You need Administrator permission.', ephemeral: true });
  }

  await interaction.deferReply();

  switch (sub) {
    case 'dashboard': return showDashboard(interaction);
    case 'panic': return handlePanic(interaction);
    case 'unlock': return handleUnlock(interaction);
    case 'audit': return handleAudit(interaction);
    case 'backups': return handleBackups(interaction);
    case 'whitelist_add': return handleWhitelist(interaction, 'add');
    case 'whitelist_remove': return handleWhitelist(interaction, 'remove');
    case 'whitelist_list': return handleWhitelist(interaction, 'list');
    case 'blacklist_add': return handleBlacklist(interaction, 'add');
    case 'blacklist_remove': return handleBlacklist(interaction, 'remove');
    case 'blacklist_list': return handleBlacklist(interaction, 'list');
  }
}

async function showDashboard(interaction) {
  const cfg = getGuildConfig(interaction.guild.id);
  const alerts = [];

  if (isPanicMode(interaction.guild.id)) alerts.push('🔴 Panic mode is ACTIVE');
  if (isRaidMode(interaction.guild.id)) alerts.push('🚨 Raid mode is ACTIVE');

  const embed = new EmbedBuilder()
    .setColor(0x2b2d31)
    .setTitle('🛡️ Security Dashboard')
    .addFields(
      { name: 'Panic Mode', value: isPanicMode(interaction.guild.id) ? '🔴 Active' : '🟢 Inactive', inline: true },
      { name: 'Raid Mode', value: isRaidMode(interaction.guild.id) ? '🔴 Active' : '🟢 Inactive', inline: true },
      { name: 'Anti-Nuke', value: cfg.antiNuke.enabled ? `🟢 On` : '⚫ Off', inline: true },
      { name: 'Anti-Spam', value: cfg.antiSpam.enabled ? `🟢 On` : '⚫ Off', inline: true },
      { name: 'Anti-Raid', value: cfg.antiRaid.enabled ? `🟢 On` : '⚫ Off', inline: true },
      { name: 'Anti-Link', value: cfg.antiLink.enabled ? '🟢 On' : '⚫ Off', inline: true },
      { name: 'Anti-Bot', value: cfg.antiBot.enabled ? '🟢 On' : '⚫ Off', inline: true },
      { name: 'Anti-Scam', value: cfg.antiScam.enabled ? '🟢 On' : '⚫ Off', inline: true },
      { name: 'AutoMod', value: cfg.autoMod.enabled ? '🟢 On' : '⚫ Off', inline: true },
      { name: 'Auto Backup', value: cfg.autoBackup ? '🟢 On' : '⚫ Off', inline: true },
      { name: 'Whitelisted', value: `${cfg.whitelist.length} users`, inline: true },
      { name: 'Blacklisted', value: `${cfg.blacklist.length} users`, inline: true },
    )
    .setFooter({ text: `Logs: ${cfg.logChannelId ? '✅' : '❌ Not set'}` })
    .setTimestamp();

  if (alerts.length > 0) embed.setDescription(alerts.join('\n'));

  await interaction.editReply({ embeds: [embed] });
}

async function handlePanic(interaction) {
  const r = await enablePanicMode(interaction.guild, interaction.member);
  await interaction.editReply({ content: r.success ? `✅ ${r.message}` : `❌ ${r.message}` });
}

async function handleUnlock(interaction) {
  const r = await disablePanicMode(interaction.guild, interaction.member);
  await interaction.editReply({ content: r.success ? `✅ ${r.message}` : `❌ ${r.message}` });
}

async function handleAudit(interaction) {
  await interaction.editReply({ content: '⏳ Analyzing...' });
  const results = await analyzeAuditLogs(interaction.guild);
  if (results.length === 0) {
    return interaction.editReply({ content: '✅ No suspicious activity in 24h.' });
  }
  const embed = new EmbedBuilder()
    .setColor(0xed4245).setTitle('🔍 Audit Analysis')
    .setDescription(results.map(r => `**${r.severity === 'high' ? '🔴' : '🟡'}** ${r.message}`).join('\n'))
    .setTimestamp();
  await interaction.editReply({ content: null, embeds: [embed] });
}

async function handleBackups(interaction) {
  const backups = await listBackups(interaction.guild.id);
  if (backups.length === 0) return interaction.editReply({ content: 'No backups yet.' });
  const embed = new EmbedBuilder()
    .setColor(0x2b2d31).setTitle('📦 Recent Backups')
    .setDescription(backups.slice(0, 10).map((b, i) =>
      `**#${i + 1}** ${new Date(b.timestamp).toLocaleString()} — ${b.channels}ch, ${b.roles}roles`
    ).join('\n'))
    .setFooter({ text: `${backups.length} total` }).setTimestamp();
  await interaction.editReply({ content: null, embeds: [embed] });
}

async function handleWhitelist(interaction, action) {
  if (action === 'list') {
    const cfg = getGuildConfig(interaction.guild.id);
    const list = cfg.whitelist.map(id => `<@${id}>`).join(', ') || '*None*';
    return interaction.editReply({ content: `**Whitelisted:** ${list}` });
  }
  const user = interaction.options.getUser('user');
  if (!user) return interaction.editReply({ content: '❌ Specify a user.' });
  if (action === 'add') addWhitelist(interaction.guild.id, user.id);
  else removeWhitelist(interaction.guild.id, user.id);
  await logSecurityAction(interaction.guild, `WHITELIST_${action.toUpperCase()}`, { user: user.tag }, interaction.member);
  await interaction.editReply({ content: `✅ ${action === 'add' ? 'Added' : 'Removed'} ${user.tag}.` });
}

async function handleBlacklist(interaction, action) {
  if (action === 'list') {
    const cfg = getGuildConfig(interaction.guild.id);
    const list = cfg.blacklist.map(id => `<@${id}>`).join(', ') || '*None*';
    return interaction.editReply({ content: `**Blacklisted:** ${list}` });
  }
  const user = interaction.options.getUser('user');
  if (!user) return interaction.editReply({ content: '❌ Specify a user.' });
  if (action === 'add') addBlacklist(interaction.guild.id, user.id);
  else removeBlacklist(interaction.guild.id, user.id);
  await logSecurityAction(interaction.guild, `BLACKLIST_${action.toUpperCase()}`, { user: user.tag }, interaction.member);
  await interaction.editReply({ content: `✅ ${action === 'add' ? 'Added' : 'Removed'} ${user.tag}.` });
}
