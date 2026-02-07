#!/bin/bash

##
# Script de déploiement du bot Telegram sur VPS
# Usage: ./deploy_bot.sh <VPS_HOST> <VPS_USER> [BOT_PATH]
#
# Exemples:
#   ./deploy_bot.sh 123.45.67.89 root
#   ./deploy_bot.sh vps.example.com frankito /home/frankito/bot
##

set -e

# Paramètres
VPS_HOST="${1:-$VPS_HOST}"
VPS_USER="${2:-$VPS_USER}"
BOT_PATH="${3:-/root/frankito-bot}"
SERVICE_NAME="${4:-frankito-bot}"

LOCAL_BOT_PATH="n8n-skills/bot.js"
LOCAL_ENV_PATH=".env"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Fonctions
print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${CYAN}$1${NC}"
}

# Vérifications
if [ -z "$VPS_HOST" ]; then
    print_error "VPS Host non défini"
    echo "Usage: ./deploy_bot.sh <VPS_HOST> <VPS_USER> [BOT_PATH]"
    echo "Ou définir les variables d'environnement VPS_HOST et VPS_USER"
    exit 1
fi

if [ -z "$VPS_USER" ]; then
    print_error "VPS User non défini"
    echo "Usage: ./deploy_bot.sh <VPS_HOST> <VPS_USER> [BOT_PATH]"
    exit 1
fi

if [ ! -f "$LOCAL_BOT_PATH" ]; then
    print_error "Fichier bot.js introuvable: $LOCAL_BOT_PATH"
    exit 1
fi

print_info "🚀 Déploiement du bot sur VPS"
print_info "📡 Host: $VPS_HOST"
print_info "👤 User: $VPS_USER"
print_info "📁 Path: $BOT_PATH"
echo ""

# Test connexion SSH
echo "[1/5] Test de connexion SSH..."
if ssh -o ConnectTimeout=5 -o BatchMode=yes "$VPS_USER@$VPS_HOST" "echo 'OK'" >/dev/null 2>&1; then
    print_success "Connexion SSH réussie"
else
    print_error "Impossible de se connecter au VPS"
    echo "Assurez-vous que:"
    echo "  1. Votre clé SSH est configurée"
    echo "  2. Le VPS est accessible"
    echo "  3. Les credentials sont corrects"
    exit 1
fi

# Créer le dossier distant
echo "[2/5] Création du dossier distant..."
if ssh "$VPS_USER@$VPS_HOST" "mkdir -p $BOT_PATH"; then
    print_success "Dossier créé/vérifié"
else
    print_error "Erreur lors de la création du dossier"
    exit 1
fi

# Copier bot.js
echo "[3/5] Upload de bot.js..."
if scp "$LOCAL_BOT_PATH" "$VPS_USER@$VPS_HOST:$BOT_PATH/bot.js"; then
    print_success "bot.js uploadé"
else
    print_error "Erreur lors de l'upload de bot.js"
    exit 1
fi

# Copier .env si existe
if [ -f "$LOCAL_ENV_PATH" ]; then
    echo "[4/5] Upload de .env..."
    if scp "$LOCAL_ENV_PATH" "$VPS_USER@$VPS_HOST:$BOT_PATH/.env"; then
        print_success ".env uploadé"
    else
        print_warning "Erreur lors de l'upload de .env (non critique)"
    fi
else
    echo "[4/5] Pas de .env local (skip)"
fi

# Redémarrer le service
echo "[5/5] Redémarrage du service..."

SERVICE_RESTARTED=false

# Essayer différentes méthodes de redémarrage
RESTART_COMMANDS=(
    "pm2 restart $SERVICE_NAME"
    "pm2 restart bot"
    "systemctl restart $SERVICE_NAME"
    "cd $BOT_PATH && pm2 restart bot.js"
)

for cmd in "${RESTART_COMMANDS[@]}"; do
    echo "  Tentative: $cmd"
    if ssh "$VPS_USER@$VPS_HOST" "$cmd" >/dev/null 2>&1; then
        print_success "Service redémarré avec succès"
        SERVICE_RESTARTED=true
        break
    fi
done

if [ "$SERVICE_RESTARTED" = false ]; then
    print_warning "Le service n'a pas pu être redémarré automatiquement"
    echo ""
    echo "Connectez-vous au VPS et redémarrez manuellement:"
    echo "  ssh $VPS_USER@$VPS_HOST"
    echo "  cd $BOT_PATH"
    echo "  pm2 restart bot"
    echo "  # ou"
    echo "  node bot.js"
    echo ""
fi

echo ""
print_success "🎉 Déploiement terminé!"
echo ""
echo "Pour vérifier les logs:"
echo "  ssh $VPS_USER@$VPS_HOST 'pm2 logs $SERVICE_NAME'"
echo ""
echo "Pour vérifier le statut:"
echo "  ssh $VPS_USER@$VPS_HOST 'pm2 status'"
