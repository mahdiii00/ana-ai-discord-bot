module.exports = {
  apps: [{
    name: 'ai-discord-bot',
    script: 'src/index.js',
    cwd: __dirname,
    watch: false,
    max_memory_restart: '300M',
    restart_delay: 3000,
    max_restarts: 10,
    env: {
      NODE_ENV: 'production',
    },
  }],
};
