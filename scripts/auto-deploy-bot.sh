#!/bin/bash
#################################################
# Script de déploiement automatique Frankito Bot
# Auteur: Claude Code
# Date: 2026-02-06
#################################################

set -e  # Arrêter en cas d'erreur

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

echo "🤖 ================================================"
echo "🤖  DÉPLOIEMENT AUTOMATIQUE FRANKITO BOT"
echo "🤖 ================================================"
echo ""

# Configuration
BOT_TOKEN="8510817329:AAE72JsuTE_r-sAnclrNN5APE1wIDeKKGXE"
BOT_DIR="/root/frankito-bot"
BOT_NAME="frankito-bot"

log_info "Configuration:"
echo "  📁 Répertoire: $BOT_DIR"
echo "  🏷️  Nom PM2: $BOT_NAME"
echo ""

# ÉTAPE 1 : Vérifier Node.js
log_info "Vérification de Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    log_success "Node.js installé: $NODE_VERSION"
else
    log_error "Node.js n'est pas installé!"
    exit 1
fi

# ÉTAPE 2 : Vérifier npm
log_info "Vérification de npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    log_success "npm installé: $NPM_VERSION"
else
    log_error "npm n'est pas installé!"
    exit 1
fi

# ÉTAPE 3 : Vérifier PM2
log_info "Vérification de PM2..."
if command -v pm2 &> /dev/null; then
    PM2_VERSION=$(pm2 --version)
    log_success "PM2 installé: $PM2_VERSION"
else
    log_warning "PM2 n'est pas installé. Installation..."
    npm install -g pm2
    log_success "PM2 installé avec succès!"
fi

# ÉTAPE 4 : Créer le répertoire
log_info "Création du répertoire $BOT_DIR..."
mkdir -p "$BOT_DIR"
cd "$BOT_DIR"
log_success "Répertoire créé: $(pwd)"

# ÉTAPE 5 : Créer bot.js
log_info "Création de bot.js..."
cat > "$BOT_DIR/bot.js" << 'EOFBOT'
const { Telegraf } = require('telegraf');

// Configuration
const BOT_TOKEN = '8510817329:AAE72JsuTE_r-sAnclrNN5APE1wIDeKKGXE';

if (!BOT_TOKEN) {
    console.error('❌ Erreur: BOT_TOKEN non défini');
    process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

console.log('🤖 Initialisation de Frankito Bot...');

// Commande /start
bot.start((ctx) => {
    console.log('📩 Commande /start reçue de:', ctx.from.first_name);
    ctx.reply(
        '👋 Bienvenue sur Frankito Bot!\n\n' +
        'Commandes disponibles:\n' +
        '🔹 /start - Afficher ce message\n' +
        '🔹 /ping - Tester le bot\n' +
        '🔹 /help - Aide\n\n' +
        'Bot version 1.0 - Développé avec Claude Code'
    );
});

// Commande /ping
bot.command('ping', (ctx) => {
    const responseTime = Date.now();
    console.log('🏓 Commande /ping reçue');
    ctx.reply('🏓 Pong !');
});

// Commande /help
bot.help((ctx) => {
    ctx.reply(
        '📖 Aide Frankito Bot\n\n' +
        'Commandes:\n' +
        '/start - Message de bienvenue\n' +
        '/ping - Tester la réactivité\n' +
        '/help - Afficher cette aide\n\n' +
        'Pour toute question, contactez l\'administrateur.'
    );
});

// Gestion des erreurs
bot.catch((err, ctx) => {
    console.error('❌ Erreur Bot:', err);
    console.error('Context:', ctx.updateType);
});

// Lancement du bot
bot.launch()
    .then(() => {
        console.log('✅ Frankito Bot démarré avec succès!');
        console.log('🔑 Token utilisé:', BOT_TOKEN.substring(0, 20) + '...');
        console.log('⏰ Heure de démarrage:', new Date().toISOString());
    })
    .catch((err) => {
        console.error('❌ Erreur au démarrage:', err);
        process.exit(1);
    });

// Graceful shutdown
const shutdown = (signal) => {
    console.log(`\n🛑 Signal ${signal} reçu, arrêt du bot...`);
    bot.stop(signal);
    process.exit(0);
};

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));

// Log toutes les 5 minutes pour confirmer que le bot est actif
setInterval(() => {
    console.log('💚 Bot actif -', new Date().toISOString());
}, 5 * 60 * 1000);
EOFBOT

log_success "bot.js créé ($(wc -c < "$BOT_DIR/bot.js") bytes)"

# ÉTAPE 6 : Créer package.json
log_info "Création de package.json..."
cat > "$BOT_DIR/package.json" << 'EOFPKG'
{
  "name": "frankito-bot",
  "version": "1.0.0",
  "description": "Bot Telegram Frankito - Gestion automatisée",
  "main": "bot.js",
  "scripts": {
    "start": "node bot.js",
    "dev": "nodemon bot.js"
  },
  "keywords": ["telegram", "bot", "frankito"],
  "author": "Claude Code",
  "license": "MIT",
  "dependencies": {
    "telegraf": "^4.12.2"
  },
  "engines": {
    "node": ">=16.0.0"
  }
}
EOFPKG

log_success "package.json créé"

# ÉTAPE 7 : Installer les dépendances
log_info "Installation de telegraf (peut prendre 30-60 secondes)..."
npm install --production --quiet

if [ -d "$BOT_DIR/node_modules/telegraf" ]; then
    log_success "telegraf installé avec succès!"
else
    log_error "Échec de l'installation de telegraf"
    exit 1
fi

# ÉTAPE 8 : Arrêter l'ancien processus PM2 si existant
log_info "Nettoyage des processus PM2 existants..."
if pm2 describe "$BOT_NAME" &> /dev/null; then
    log_warning "Processus $BOT_NAME existant trouvé, suppression..."
    pm2 delete "$BOT_NAME"
    log_success "Ancien processus supprimé"
else
    log_info "Aucun processus existant"
fi

# ÉTAPE 9 : Lancer le bot avec PM2
log_info "Lancement du bot avec PM2..."
pm2 start "$BOT_DIR/bot.js" \
    --name "$BOT_NAME" \
    --time \
    --restart-delay 3000 \
    --max-restarts 10 \
    --error "$BOT_DIR/logs/error.log" \
    --output "$BOT_DIR/logs/output.log"

log_success "Bot lancé avec PM2"

# ÉTAPE 10 : Attendre que le bot démarre
log_info "Attente du démarrage du bot (5 secondes)..."
sleep 5

# ÉTAPE 11 : Sauvegarder la configuration PM2
log_info "Sauvegarde de la configuration PM2 pour auto-start..."
pm2 save
log_success "Configuration PM2 sauvegardée"

# ÉTAPE 12 : Configurer PM2 startup (optionnel, nécessite sudo)
log_info "Configuration du démarrage automatique PM2..."
if pm2 startup 2>&1 | grep -q "sudo"; then
    log_warning "PM2 startup nécessite sudo (pas configuré automatiquement)"
else
    log_success "PM2 startup configuré"
fi

# ÉTAPE 13 : Vérifier le statut du bot
log_info "Vérification du statut du bot..."
echo ""
pm2 list

echo ""
log_info "Détails du processus $BOT_NAME:"
pm2 describe "$BOT_NAME" | grep -E "status|uptime|restarts|memory|cpu"

# ÉTAPE 14 : Afficher les logs
echo ""
log_info "📜 Dernières lignes de logs:"
pm2 logs "$BOT_NAME" --lines 10 --nostream

echo ""
echo "🎉 ================================================"
echo "🎉  DÉPLOIEMENT TERMINÉ AVEC SUCCÈS!"
echo "🎉 ================================================"
echo ""
log_success "✅ Bot '$BOT_NAME' est maintenant en ligne!"
echo ""
echo "📊 Commandes utiles:"
echo "  pm2 list                    - Liste des processus"
echo "  pm2 logs $BOT_NAME          - Voir les logs en temps réel"
echo "  pm2 restart $BOT_NAME       - Redémarrer le bot"
echo "  pm2 stop $BOT_NAME          - Arrêter le bot"
echo "  pm2 delete $BOT_NAME        - Supprimer le bot de PM2"
echo ""
echo "🧪 Tests à effectuer dans Telegram:"
echo "  /start - Message de bienvenue"
echo "  /ping  - Tester la réactivité"
echo "  /help  - Aide"
echo ""

# Vérifier que le bot est vraiment "online"
STATUS=$(pm2 jlist | jq -r ".[] | select(.name==\"$BOT_NAME\") | .pm2_env.status")

if [ "$STATUS" == "online" ]; then
    echo -e "${GREEN}✅ CONFIRMATION: Bot status = ONLINE${NC}"
    exit 0
else
    echo -e "${RED}⚠️  ATTENTION: Bot status = $STATUS (attendu: online)${NC}"
    exit 1
fi
