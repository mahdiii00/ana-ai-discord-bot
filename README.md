# ana AI — Discord Bot + Dashboard

## Project Structure
```
├── src/                    # Discord bot (PM2)
│   ├── core/               # AI agent, tool registry, context manager
│   ├── tools/              # 26 tool definitions (moderation, management, info, security)
│   ├── llm/                # Groq provider, prompt builder
│   ├── memory/             # Conversation & persistent memory
│   ├── events/             # Discord event handlers
│   ├── services/           # Audit store, logging, rate limiter
│   ├── security/           # Anti-spam, anti-raid, anti-nuke, backups, panic mode
│   ├── config/             # Environment config
│   └── index.js            # Bot entry point
├── dashboard/
│   ├── backend/            # Express API server (MongoDB)
│   │   └── src/
│   │       ├── models/     # User, Guild, Ticket, AuditLog
│   │       ├── routes/     # Auth, guilds, config, logs, tickets, backups, analytics
│   │       └── index.js    # API entry point
│   └── frontend/           # React + Vite + Tailwind
│       └── src/
│           ├── pages/      # 10 dashboard pages
│           ├── components/ # Reusable UI components
│           └── lib/api.js  # API client
├── backups/                # Server backup snapshots
├── memory_data/            # User memory files
└── ecosystem.config.cjs    # PM2 config
```

## Quick Start

### Prerequisites
- Node.js 20+
- MongoDB running locally or remotely
- Discord Application with Bot + OAuth2 credentials
- Groq API key

### 1. Bot Setup
```bash
cp .env.example .env
# Edit .env with your DISCORD_TOKEN, GROQ_API_KEY
npm install
pm2 start ecosystem.config.cjs
```

### 2. Dashboard Setup
```bash
cd dashboard/backend
cp .env.example .env
# Edit .env with Discord OAuth2 credentials + MONGODB_URI
npm install
npm start          # API on :3001
```

```bash
cd dashboard/frontend
npm install
npm run dev        # UI on :5173
```

### 3. Optional: MongoDB Integration
Add `MONGODB_URI=mongodb://localhost:27017/ana-dashboard` to bot's `.env` for audit log persistence.

## Environment Variables

### Bot (.env)
| Variable | Required | Description |
|---|---|---|
| DISCORD_TOKEN | Yes | Discord bot token |
| GROQ_API_KEY | Yes | Groq API key |
| GROQ_MODEL | No | LLM model (default: llama-3.3-70b-versatile) |
| PREFIX | No | Command prefix (default: ai) |
| LOG_CHANNEL_ID | No | Discord channel for logs |
| MONGODB_URI | No | MongoDB connection for audit persistence |

### Dashboard Backend (.env)
| Variable | Required | Description |
|---|---|---|
| DISCORD_CLIENT_ID | Yes | Discord OAuth2 client ID |
| DISCORD_CLIENT_SECRET | Yes | Discord OAuth2 client secret |
| DISCORD_REDIRECT_URI | Yes | OAuth callback URL |
| MONGODB_URI | Yes | MongoDB connection string |
| SESSION_SECRET | Yes | Session encryption secret |
| FRONTEND_URL | No | Frontend URL (default: http://localhost:5173) |
