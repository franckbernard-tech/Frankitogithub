const { Telegraf } = require('telegraf');
const axios = require('axios');
require('dotenv').config();

// Configuration
// WARNING: token provided by user; storing secrets in repo is sensitive.
// The code prefers the environment variable but will fallback to the provided token.
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8510817329:AAE72JsuTE_r-sAnclrNN5APE1wIDeKKGXE';
const N8N_WEBHOOK = 'https://n8n.srv1289936.hstgr.cloud/webhook-test/ordre-frankito';

if (!BOT_TOKEN) {
  console.error('❌ Erreur: TELEGRAM_BOT_TOKEN non défini dans .env');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);
const fs = require('fs');
const CHAT_ID_FILE = 'n8n-skills/chat_ids.txt';

function saveChatId(id) {
  try {
    let list = [];
    if (fs.existsSync(CHAT_ID_FILE)) {
      const raw = fs.readFileSync(CHAT_ID_FILE, { encoding: 'utf8' });
      list = raw.split(/\r?\n/).filter(Boolean);
    }
    if (!list.includes(String(id))) {
      list.push(String(id));
      fs.writeFileSync(CHAT_ID_FILE, list.join('\n') + '\n', { encoding: 'utf8' });
      console.log(`💾 Saved chatId ${id} to ${CHAT_ID_FILE}`);
    }
  } catch (err) {
    console.error('Error saving chatId:', err.message);
  }
}

console.log('🤖 Bot Frankito démarré...');

// If a default chat id is provided, send a startup confirmation message.
const DEFAULT_CHAT_ID = 673173233; // provided by user

async function sendStartupPing() {
  try {
    if (!BOT_TOKEN) return;
    // send a one-off message to confirm the bot is operational
    await bot.telegram.sendMessage(DEFAULT_CHAT_ID, 'Système opérationnel, Frankito !');
    console.log('✅ Startup ping sent to', DEFAULT_CHAT_ID);
  } catch (err) {
    console.error('Failed to send startup ping:', err && err.message ? err.message : err);
  }
}

// Try to send startup ping (non-blocking)
sendStartupPing();

// Commande /start
bot.start((ctx) => {
  ctx.reply('👋 Bienvenue! Utilisez /n8n <message> pour envoyer une commande à N8N');
});

// Commande /register : enregistre le chatId dans un fichier pour utilisation ultérieure
bot.command('register', (ctx) => {
  const chatId = ctx.chat.id;
  saveChatId(chatId);
  ctx.reply(`✅ Chat enregistré: ${chatId}`);
});

// Commande /help
bot.help((ctx) => {
  ctx.reply(`
📋 Commandes disponibles:

/n8n <message> - Envoie un message au webhook N8N
/help - Affiche cette aide
/ping - Teste la connexion
  `);
});

// Commande /ping
bot.command('ping', (ctx) => {
  ctx.reply('🏓 Pong! Le bot est actif.');
});

// Traiter les commandes /n8n
bot.command('n8n', async (ctx) => {
  const message = ctx.message.text.replace('/n8n', '').trim();

  if (!message) {
    ctx.reply('❌ Erreur: Utilisez /n8n <votre_message>\n\nExemple: /n8n créer une tâche');
    return;
  }

  // Message de chargement
  const loadingMsg = await ctx.reply('⏳ Envoi en cours...');

  try {
    // Préparer les données
    const payload = {
      command: '/n8n',
      message: message,
      userId: ctx.from.id,
      userName: ctx.from.first_name || '',
      userLastName: ctx.from.last_name || '',
      chatId: ctx.chat.id,
      timestamp: new Date().toISOString()
    };

    console.log(`📨 Envoi à N8N: ${message}`);

    // Envoyer le POST
    const response = await axios.post(N8N_WEBHOOK, payload, {
      timeout: 5000,
      headers: { 'Content-Type': 'application/json' }
    });

    console.log(`✅ Réponse N8N (${response.status})`);

    // Supprimer le message de chargement
    await ctx.deleteMessage(loadingMsg.message_id);

    // Enregistrer le chatId si inconnu (utile pour tests automatiques)
    try { saveChatId(ctx.chat.id); } catch (e) { /* non bloquant */ }

    // Envoyer la confirmation
    ctx.reply(`✅ Message envoyé avec succès!\n\n📤 Contenu: ${message}`);

  } catch (error) {
    console.error(`❌ Erreur: ${error.message}`);

    // Supprimer le message de chargement
    await ctx.deleteMessage(loadingMsg.message_id);

    let errorMsg = '❌ Erreur lors de l\'envoi:\n';
    if (error.response) {
      errorMsg += `Status: ${error.response.status}`;
    } else if (error.code === 'ECONNREFUSED') {
      errorMsg += 'Webhook N8N non accessible';
    } else if (error.code === 'ECONNABORTED') {
      errorMsg += 'Timeout (réponse trop lente)';
    } else {
      errorMsg += error.message;
    }

    ctx.reply(errorMsg);
  }
});

// Message par défaut
bot.on('message', (ctx) => {
  ctx.reply('💬 Commande non reconnue. Utilisez /help pour voir les commandes.');
});

// Gestion des erreurs
bot.catch((err) => {
  console.error('❌ Erreur Bot:', err);
});

// Démarrer le bot
bot.launch();

console.log('✅ Bot en écoute...');

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
