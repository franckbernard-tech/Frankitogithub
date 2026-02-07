#!/bin/bash
# Déploiement Frankito Bot - One-liner

# Créer le répertoire
mkdir -p /root/frankito-bot

# Créer bot.js
cat > /root/frankito-bot/bot.js << 'EOFBOT'
const { Telegraf } = require('telegraf');

const BOT_TOKEN = '8510817329:AAE72JsuTE_r-sAnclrNN5APE1wIDeKKGXE';
const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => {
  ctx.reply('👋 Bienvenue sur Frankito Bot!\n\nCommandes:\n/start - Afficher ce message\n/ping - Tester le bot');
});

bot.command('ping', (ctx) => {
  ctx.reply('🏓 Pong !');
});

bot.catch((err) => {
  console.error('❌ Erreur Bot:', err);
});

bot.launch();
console.log('✅ Frankito Bot démarré!');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
EOFBOT

# Créer package.json
cat > /root/frankito-bot/package.json << 'EOFPKG'
{
  "name": "frankito-bot",
  "version": "1.0.0",
  "description": "Bot Telegram Frankito",
  "main": "bot.js",
  "scripts": {
    "start": "node bot.js"
  },
  "dependencies": {
    "telegraf": "^4.12.2"
  }
}
EOFPKG

# Installer les dépendances
echo "📥 Installation de telegraf..."
cd /root/frankito-bot
npm install --production

# Supprimer ancien processus PM2 si existant
pm2 delete frankito-bot 2>/dev/null || true

# Lancer avec PM2
echo "🚀 Lancement avec PM2..."
pm2 start bot.js --name frankito-bot

# Sauvegarder PM2 pour auto-start
pm2 save

# Afficher le statut
echo ""
echo "🎉 DÉPLOIEMENT TERMINÉ!"
echo ""
pm2 list
echo ""
echo "📜 Logs:"
pm2 logs frankito-bot --lines 10 --nostream

echo ""
echo "✅ Bot déployé avec succès!"
echo "💡 Testez dans Telegram: /start puis /ping"
