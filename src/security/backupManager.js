import fs from 'fs/promises';
import path from 'path';
import { ChannelType } from 'discord.js';

const BACKUP_DIR = path.resolve('backups');

async function guildDir(guildId) {
  const dir = path.join(BACKUP_DIR, guildId);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

export async function createBackup(guild) {
  if (!guild) throw new Error('No guild');
  if (!guild.roles || !guild.channels) throw new Error('Guild data not loaded');
  if (!guild.roles.cache || !guild.channels.cache) throw new Error('Guild not cached');

  const timestamp = Date.now();
  const data = {
    id: guild.id,
    name: guild.name,
    timestamp,
    icon: guild.iconURL(),
    roles: [],
    categories: [],
    channels: [],
  };

  for (const role of guild.roles.cache.sort((a, b) => b.position - a.position).values()) {
    if (role.id === guild.id) continue;
    data.roles.push({
      id: role.id,
      name: role.name,
      color: role.color,
      hoist: role.hoist,
      mentionable: role.mentionable,
      permissions: role.permissions.bitfield.toString(),
      position: role.position,
    });
  }

  for (const channel of guild.channels.cache.sort((a, b) => (a.position || 0) - (b.position || 0)).values()) {
    if (channel.type === ChannelType.GuildCategory) {
      data.categories.push({
        id: channel.id,
        name: channel.name,
        position: channel.position,
      });
    } else {
      const overwrites = [];
      if (channel.permissionOverwrites?.cache) for (const overwrite of channel.permissionOverwrites.cache.values()) {
        overwrites.push({
          id: overwrite.id,
          type: overwrite.type,
          allow: overwrite.allow.bitfield.toString(),
          deny: overwrite.deny.bitfield.toString(),
        });
      }
      data.channels.push({
        id: channel.id,
        name: channel.name,
        type: channel.type,
        parentId: channel.parentId,
        position: channel.position,
        topic: channel.topic || null,
        nsfw: channel.nsfw || false,
        rateLimitPerUser: channel.rateLimitPerUser || 0,
        permissionOverwrites: overwrites,
      });
    }
  }

  const filename = `backup-${timestamp}.json`;
  const filepath = path.join(await guildDir(guild.id), filename);
  await fs.writeFile(filepath, JSON.stringify(data, null, 2));
  return { filename, timestamp, channels: data.channels.length, roles: data.roles.length, categories: data.categories.length };
}

export async function listBackups(guildId) {
  const dir = await guildDir(guildId);
  let files;
  try {
    files = await fs.readdir(dir);
  } catch {
    return [];
  }
  files = files.filter(f => f.startsWith('backup-') && f.endsWith('.json')).sort().reverse();
  const results = [];
  for (const f of files) {
    try {
      const content = await fs.readFile(path.join(dir, f), 'utf8');
      const data = JSON.parse(content);
      results.push({
        filename: f,
        timestamp: data.timestamp,
        channels: data.channels.length,
        roles: data.roles.length,
        categories: data.categories.length,
      });
    } catch {}
  }
  return results;
}

export async function getLatestBackup(guildId) {
  const backups = await listBackups(guildId);
  if (backups.length === 0) return null;
  const dir = await guildDir(guildId);
  const content = await fs.readFile(path.join(dir, backups[0].filename), 'utf8');
  return JSON.parse(content);
}

export async function dailyBackup(client) {
  console.log('[Backup] Running daily backup for all guilds...');
  for (const guild of client.guilds.cache.values()) {
    try {
      if (!guild || !guild.id) continue;
      if (!guild.available || !guild.channels) { console.log(`[Backup] Skipping ${guild.name}: unavailable`); continue; }
      try { await guild.fetch(); } catch {}
      try { if (guild.channels?.fetch) await guild.channels.fetch(); } catch {}
      try { if (guild.roles?.fetch) await guild.roles.fetch(); } catch {}
      if (!guild.roles?.cache?.size || !guild.channels?.cache?.size) {
        console.log(`[Backup] Skipping ${guild.name}: not fully cached`);
        continue;
      }
      const result = await createBackup(guild);
      console.log(`[Backup] ${guild.name}: ${result.roles} roles, ${result.categories} categories, ${result.channels} channels`);
    } catch (error) {
      console.error(`[Backup] Failed for ${guild.name}:`, error.message);
      console.error(error.stack);
    }
  }
}
