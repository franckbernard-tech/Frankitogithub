/**
 * Bot Telegram Frankito
 * Commandes supportées:
 * - /n8n <message> : Envoie le message au webhook N8N
 * - /help : Affiche l'aide
 */

const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
require('dotenv').config();

// Configuration
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';
const N8N_WEBHOOK = 'https://n8n.srv1289936.hstgr.cloud/webhook-test/ordre-frankito';
const WEBHOOK_TIMEOUT = 5000; // 5 secondes

// Initialiser le bot
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

console.log('🤖 Bot Telegram Frankito démarré...');
console.log(`📡 Webhook N8N: ${N8N_WEBHOOK}`);

// Gestion des messages texte
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text || '';
  const userId = msg.from.id;
  const userName = msg.from.first_name || 'Utilisateur';

  console.log(`📨 Message de ${userName} (ID: ${userId}): ${text}`);

  // Commande /n8n
  if (text.startsWith('/n8n')) {
    await handleN8nCommand(chatId, text, msg);
  }
  // Commande /help
  else if (text === '/help' || text === '/start') {
    await sendHelp(chatId);
  }
  // Commande /ping
  else if (text === '/ping') {
    await bot.sendMessage(chatId, '🏓 Pong! Le bot est actif.');
  }
  // Autres messages
  else {
    await bot.sendMessage(
      chatId,
      '👋 Bienvenue! Utilisez /help pour voir les commandes disponibles.'
    );
  }
});

/**
 * Traite la commande /n8n
 */
async function handleN8nCommand(chatId, text, msg) {
  try {
    // Extraire le message après /n8n
    const parts = text.split(/\s+/);
    
    if (parts.length < 2) {
      await bot.sendMessage(
        chatId,
        '❌ Erreur: Utilisez /n8n <votre_message>\n\nExemple: /n8n créer une tâche'
      );
      return;
    }

    // Récupérer le message complet (tout après /n8n)
    const payload = text.replace('/n8n', '').trim();

    // Message de chargement
    const loadingMsg = await bot.sendMessage(
      chatId,
      '⏳ Envoi du message à N8N en cours...'
    );

    // Préparer les données
    const dataToSend = {
      command: '/n8n',
      message: payload,
      userId: msg.from.id,
      userName: msg.from.first_name || 'Utilisateur',
      userLastName: msg.from.last_name || '',
      chatId: chatId,
      timestamp: new Date().toISOString(),
      originalMessage: msg
    };

    console.log(`🚀 Envoi à N8N:`, dataToSend);

    // Envoyer le POST au webhook N8N
    const response = await axios.post(N8N_WEBHOOK, dataToSend, {
      timeout: WEBHOOK_TIMEOUT,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log(`✅ Réponse N8N:`, response.status, response.data);

    // Supprimer le message de chargement et envoyer la confirmation
    await bot.deleteMessage(chatId, loadingMsg.message_id);

    const successMessage = `✅ **Commande envoyée avec succès!**

📤 Message: \`${payload}\`
🔗 Webhook: N8N
⏱️ Timestamp: ${new Date().toLocaleTimeString('fr-FR')}

${response.data?.message ? `📝 Réponse: ${response.data.message}` : ''}`;

    await bot.sendMessage(chatId, successMessage, { parse_mode: 'Markdown' });

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi à N8N:', error.message);

    let errorMessage = '❌ **Erreur lors de l\'envoi du message**\n\n';

    if (error.response) {
      // Erreur HTTP
      errorMessage += `🔴 Status: ${error.response.status}\n`;
      errorMessage += `Message: ${error.response.statusText}\n`;
      if (error.response.data) {
        errorMessage += `Détails: ${JSON.stringify(error.response.data)}`;
      }
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage += 'Le webhook N8N n\'est pas accessible. Vérifiez votre connexion.';
    } else if (error.code === 'ECONNABORTED') {
      errorMessage += 'Timeout: Le webhook a mis trop de temps à répondre (>5s).';
    } else {
      errorMessage += `Erreur: ${error.message}`;
    }

    await bot.sendMessage(chatId, errorMessage, { parse_mode: 'Markdown' });
  }
}

/**
 * Envoie le message d'aide
 */
async function sendHelp(chatId) {
  const helpMessage = `
🤖 **Bot Telegram Frankito - Aide**

📋 **Commandes disponibles:**

🔹 **/n8n <message>**
   Envoie un message à votre workflow N8N
   Exemple: \`/n8n créer une nouvelle tâche\`

🔹 **/help**
   Affiche cette aide

🔹 **/ping**
   Vérifiez si le bot est actif

📡 **Webhook N8N:**
   \`${N8N_WEBHOOK}\`

⚙️ **Configuration requise:**
   - TELEGRAM_BOT_TOKEN dans .env
   - Node.js 14+
   - node-telegram-bot-api
   - axios

💡 **Exemples d'utilisation:**
   /n8n ajouter un client
   /n8n générer un rapport
   /n8n envoyer une alerte

🔐 **Sécurité:**
   - Les données sont envoyées via POST
   - Token stocké dans .env (jamais commité)
   - Validation des entrées activée
`;

  await bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
}

// Gestion des erreurs non attrapées
bot.on('error', (error) => {
  console.error('❌ Erreur Bot:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rejetée non gérée:', reason);
});

console.log('✅ Bot en écoute...');
