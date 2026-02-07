const { Telegraf } = require('telegraf');
const axios = require('axios');
const config = require('../config');

// Charger et valider la configuration
config.validate();

const BOT_TOKEN = config.telegram.botToken;
const N8N_API = `${config.n8n.apiUrl}/api/v1/workflows`;
const N8N_KEY = config.n8n.apiKey;

const bot = new Telegraf(BOT_TOKEN);

bot.command('n8n', async (ctx) => {
  const msg = ctx.message.text.replace('/n8n', '').trim();
  if (!msg) return ctx.reply('Usage: /n8n <message>');

  try {
    const workflow = {
      name: `Auto-${Date.now()}`,
      nodes: [
        {
          parameters: {},
          name: 'Start',
          type: 'n8n-nodes-base.manualTrigger',
          typeVersion: 1,
          position: [250, 300]
        },
        {
          parameters: {
            values: {
              string: [{ name: 'request', value: msg }]
            }
          },
          name: 'Data',
          type: 'n8n-nodes-base.set',
          typeVersion: 3.4,
          position: [450, 300]
        }
      ],
      connections: { 'Start': { main: [[{ node: 'Data', type: 'main', index: 0 }]] } }
    };

    const res = await axios.post(N8N_API, workflow, {
      headers: { 'X-N8N-API-KEY': N8N_KEY, 'Content-Type': 'application/json' }
    });

    ctx.reply(`✅ Workflow créé!\nID: ${res.data.id}\nURL: ${config.n8n.apiUrl}/workflow/${res.data.id}`);
  } catch (err) {
    ctx.reply(`❌ Erreur: ${err.message}`);
  }
});

bot.start(ctx => ctx.reply('Bot prêt! Utilisez /n8n <message>'));
bot.launch();
console.log('✅ Bot démarré');
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
