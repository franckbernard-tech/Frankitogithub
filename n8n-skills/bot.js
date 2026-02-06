const { Telegraf } = require('telegraf');
const axios = require('axios');
require('dotenv').config();

// Configuration
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const N8N_WEBHOOK = 'https://n8n.srv1289936.hstgr.cloud/webhook-test/ordre-frankito';

if (!BOT_TOKEN) {
  console.error('❌ Erreur: TELEGRAM_BOT_TOKEN non défini dans .env');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

console.log('🤖 Bot Frankito démarré...');

// Commande /start
bot.start((ctx) => {
  ctx.reply('👋 Bienvenue! Utilisez /n8n <message> pour envoyer une commande à N8N');
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
