# AI Discord Server Manager

An AI-powered Discord moderation bot that understands natural language in **Algerian Darija (Arabizi)**, **Arabic**, **French**, and **English**.

## Features

- **Multi-language** — Speak naturally in Darija, Arabic, French, or English
- **Intent-based parsing** — Uses Groq (Llama 3.3) to understand what you mean, not just keywords
- **Conversation memory** — Remembers the last 30 messages per channel for context-aware commands
- **Confirmation prompts** — Dangerous actions (ban, kick, delete channel, etc.) ask before executing
- **Permission checks** — Every action verifies the user has the required Discord permissions

### Supported actions

| Category | Actions |
|---|---|
| **User management** | kick, ban, unban, timeout, warn, nickname |
| **Roles** | create, delete, rename, assign, remove, list |
| **Channels** | create, delete, rename, move, lock, unlock, slowmode, topic |
| **Categories** | create |
| **Threads** | create, delete, archive, unarchive |
| **Voice** | move, disconnect, mute, unmute, deafen, undeafen |
| **Server** | rename, description, icon |
| **Messages** | clear, add emoji, remove emoji |
| **Permissions** | change channel permissions |

## Commands

- **Slash:** `/admin command: <your instruction>`
- **Prefix:** `ai <your instruction>`

### Examples

```
ai kick @user
ai 3mel role smitha VIP
ai bani had lmember
ai lock had channel
ai clear 50 messages
ai mute @user f voice
ai 3ti role Admin l @user
ai/timeout 10m
ai create thread discussion
ai move @user to General
```

## Setup

1. Clone the repo
2. Copy `.env.example` to `.env` and fill in:
   - `DISCORD_TOKEN` — from https://discord.com/developers/applications
   - `GROQ_API_KEY` — from https://console.groq.com/keys
3. Run `npm install`
4. Run `npm start`

## Tech stack

- Discord.js v14
- Groq SDK (Llama 3.3 70B)
- Node.js 18+
