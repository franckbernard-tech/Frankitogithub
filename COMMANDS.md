# 📋 Liste des Commandes - Frankito-IA

Guide de référence rapide avec toutes les commandes essentielles pour gérer le projet.

---

## 🚀 Quick Start (Setup Initial)

### 1. Installation
```bash
# Cloner le projet
git clone https://github.com/votre-org/Frankito-IA.git
cd Frankito-IA

# Installer les dépendances
npm install

# Copier le template de configuration
cp .env.template .env

# Éditer les credentials (Windows)
notepad .env

# Éditer les credentials (Linux/Mac)
nano .env
```

### 2. Validation
```bash
# Vérifier la portabilité
node portability-check.js

# Vérifier la santé du système
node health-check.js
```

---

## 🔐 Rotation des Credentials

### Mode Automatique (Recommandé)
```bash
# Créer fichier temporaire avec nouveaux tokens
echo "TELEGRAM_BOT_TOKEN=votre_token" > new-creds.tmp
echo "N8N_API_KEY=votre_cle" >> new-creds.tmp

# Lancer la rotation automatique
node auto-rotate.js --from-file=new-creds.tmp
```

### Mode CLI Arguments
```bash
node auto-rotate.js \
  --telegram="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz" \
  --n8n="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Mode Interactif
```bash
node rotate-credentials.js
```

---

## 🔧 Audit et Corrections

### Audit Complet
```bash
# Test de portabilité
node portability-check.js --verbose

# Lire le rapport d'audit
cat AUDIT-REPORT.md

# Ou ouvrir dans éditeur
code AUDIT-REPORT.md
```

### Auto-Fix

#### Dry-Run (Simulation)
```bash
# Voir ce qui serait fait sans modifier
node auto-fix.js --dry-run
```

#### Fixes Critiques Uniquement
```bash
# Appliquer seulement les corrections critiques
node auto-fix.js --critical-only
```

#### Tous les Fixes
```bash
# Appliquer tous les fixes (critiques + importants + optionnels)
node auto-fix.js --all
```

#### Mode Normal (Critiques + Importants)
```bash
# Appliquer critiques et importants
node auto-fix.js
```

---

## 🧹 Nettoyage

### Supprimer Fichiers Dangereux (CRITIQUE)
```bash
# Supprimer fichiers avec credentials hardcodées
rm create_workflow.py
rm .env.backup

# Supprimer scripts dupliqués
rm fix-workflow.js fix-workflow-v2.js fix-workflow-v3.js
```

### Nettoyer Fichiers Temporaires
```bash
# Supprimer execution files à la racine
rm execution_*.json

# Ou les déplacer vers executions/
mkdir -p executions
mv execution_*.json executions/
```

### Nettoyer Archive (Après Rotation)
```bash
# Supprimer le dossier archive après rotation
rm -rf archive/

# Windows PowerShell
Remove-Item -Recurse -Force archive
```

### Nettoyer node_modules
```bash
# Réinstaller proprement
rm -rf node_modules package-lock.json
npm install
```

---

## 📦 Gestion des Dépendances

### Installation
```bash
# Installer toutes les dépendances
npm install

# Installer une dépendance spécifique
npm install dotenv

# Installer dépendance de dev
npm install --save-dev eslint
```

### Audit de Sécurité
```bash
# Vérifier les vulnérabilités
npm audit

# Corriger automatiquement
npm audit fix

# Voir les détails
npm audit --json
```

### Mise à Jour
```bash
# Voir les packages obsolètes
npm outdated

# Mettre à jour tous les packages (prudent)
npm update

# Mettre à jour un package spécifique
npm update telegraf
```

---

## 🔍 Diagnostic

### Health Check
```bash
# Health check complet
node health-check.js

# Résultat attendu:
# ✅ Fichier .env
# ✅ Configuration
# ✅ Connexion N8N
# ✅ Workflow Master
# ✅ Bot Telegram
# ✅ SYSTÈME OPÉRATIONNEL
```

### Portability Check
```bash
# Check basique
node portability-check.js

# Avec détails
node portability-check.js --verbose

# Score attendu: > 70%
```

### Tests Manuels
```bash
# Tester le bot Telegram
node n8n-skills/bot.js
# Ctrl+C pour arrêter

# Tester UI de rotation (dry-run)
node test-rotation-ui.js
```

---

## 🌳 Git

### Statut et Commits

```bash
# Voir l'état actuel
git status

# Voir les différences
git diff

# Ajouter tous les fichiers modifiés
git add -A

# Commit de sécurité après audit
git commit -m "chore: apply security audit fixes"

# Commit après rotation
git commit -m "chore: rotate credentials and cleanup"
```

### Vérifier .env Pas Commitée
```bash
# Vérifier que .env n'est PAS trackée
git ls-files | grep .env
# Résultat attendu: vide (seulement .env.template devrait apparaître)

# Vérifier .gitignore
cat .gitignore | grep .env
# Résultat attendu: .env doit être listé
```

### Historique
```bash
# Voir les derniers commits
git log --oneline -10

# Voir les fichiers modifiés dans dernier commit
git show --stat

# Chercher "password" dans l'historique (audit sécurité)
git log -p -S "password"
```

### Branches
```bash
# Créer branche pour refactoring
git checkout -b refactor/audit-fixes

# Revenir à main
git checkout main

# Merger la branche
git merge refactor/audit-fixes
```

---

## 🤖 Bot Telegram

### Démarrer
```bash
# Démarrer le bot
node n8n-skills/bot.js

# Avec logs détaillés (si implémenté)
DEBUG=* node n8n-skills/bot.js
```

### En Production (avec PM2)
```bash
# Installer PM2 globalement
npm install -g pm2

# Démarrer le bot avec PM2
pm2 start n8n-skills/bot.js --name frankito-bot

# Voir les logs
pm2 logs frankito-bot

# Redémarrer
pm2 restart frankito-bot

# Arrêter
pm2 stop frankito-bot

# Supprimer du PM2
pm2 delete frankito-bot

# Sauvegarder la config PM2
pm2 save

# Auto-démarrage au boot
pm2 startup
```

---

## 📁 Structure et Organisation

### Créer Structure Recommandée
```bash
# Créer tous les dossiers recommandés
mkdir -p src/{bot,utils}
mkdir -p scripts/{rotation,health,deployment,tests}
mkdir -p workflows/{production,templates}
mkdir -p executions
mkdir -p docs/{guides,architecture,audit}
```

### Déplacer Fichiers
```bash
# Déplacer scripts de rotation
mv auto-rotate.js rotate-credentials.js cleanup-final.js scripts/rotation/

# Déplacer health-check
mv health-check.js scripts/health/

# Déplacer tests
mv test-rotation-ui.js beep.js ding.js scripts/tests/

# Déplacer documentation
mv ROTATION-GUIDE.md QUICK-START.md docs/guides/
mv AUDIT-REPORT.md PORTABILITY-GUIDE.md docs/audit/
mv CLAUDE.md "règles du jeu- automatisation N8N.md" docs/architecture/
```

---

## 🔒 Sécurité

### Permissions .env

#### Linux/Mac
```bash
# Restreindre permissions .env (lecture/écriture propriétaire uniquement)
chmod 600 .env

# Vérifier
ls -la .env
# Résultat attendu: -rw------- (600)
```

#### Windows PowerShell
```powershell
# Restreindre accès .env
icacls .env /inheritance:r /grant:r "$($env:USERNAME):(R,W)"
```

### Scan de Sécurité
```bash
# Scan avec npm audit
npm audit

# Scan des credentials exposées (nécessite git-secrets)
git secrets --scan

# Vérifier aucun secret dans les fichiers
grep -r "TELEGRAM_BOT_TOKEN.*=" --include="*.js" --exclude-dir=node_modules .
grep -r "N8N_API_KEY.*=" --include="*.js" --exclude-dir=node_modules .
```

---

## 🐳 Docker (Optionnel)

### Build et Run
```bash
# Build l'image
docker build -t frankito-ia .

# Run le container
docker run -it --env-file .env frankito-ia

# Run en background
docker run -d --name frankito-bot --env-file .env frankito-ia

# Voir les logs
docker logs -f frankito-bot

# Arrêter
docker stop frankito-bot

# Supprimer
docker rm frankito-bot
```

### Docker Compose
```bash
# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter
docker-compose down

# Rebuild après modifications
docker-compose up -d --build
```

---

## 🧪 Tests et Validation

### Validation Syntaxe JavaScript
```bash
# Vérifier syntaxe d'un fichier
node --check auto-rotate.js

# Vérifier tous les fichiers .js
find . -name "*.js" -not -path "./node_modules/*" -exec node --check {} \;

# Windows PowerShell
Get-ChildItem -Recurse -Filter *.js -Exclude node_modules | ForEach-Object { node --check $_.FullName }
```

### Linting (si ESLint configuré)
```bash
# Installer ESLint
npm install --save-dev eslint

# Initialiser config
npx eslint --init

# Linter tous les fichiers
npx eslint .

# Corriger automatiquement
npx eslint . --fix
```

---

## 📊 Monitoring et Logs

### Logs Système
```bash
# Voir les logs du bot (si logs implémentés)
tail -f logs/bot.log

# Logs N8N (via interface web)
# https://n8n.srv1289936.hstgr.cloud

# Logs PM2
pm2 logs frankito-bot --lines 100
```

### Monitoring Ressources
```bash
# CPU et mémoire (Linux/Mac)
top

# Processus Node.js
ps aux | grep node

# Avec PM2
pm2 monit
```

---

## 🔄 Workflow Complet de Maintenance

### Hebdomadaire
```bash
# 1. Audit de sécurité
npm audit

# 2. Vérifier santé
node health-check.js

# 3. Vérifier logs
pm2 logs frankito-bot --lines 50

# 4. Backup .env
cp .env .env.backup.$(date +%Y%m%d)

# 5. Vérifier updates
npm outdated
```

### Mensuel
```bash
# 1. Rotation credentials (si nécessaire)
node auto-rotate.js --from-file=new-creds.tmp

# 2. Audit complet
node portability-check.js --verbose

# 3. Cleanup
node cleanup-final.js

# 4. Git cleanup
git gc
git prune
```

### Avant Déploiement
```bash
# 1. Tests
node health-check.js
node portability-check.js

# 2. Validation
npm audit
git status

# 3. Commit
git add -A
git commit -m "chore: prepare deployment"

# 4. Tag version
git tag -a v1.0.0 -m "Version 1.0.0"
git push --tags
```

---

## ⚡ Raccourcis Utiles

### Alias Recommandés (Bash/Zsh)

Ajouter à `~/.bashrc` ou `~/.zshrc`:

```bash
# Frankito-IA aliases
alias fk-check="node health-check.js"
alias fk-port="node portability-check.js"
alias fk-fix="node auto-fix.js"
alias fk-rotate="node auto-rotate.js"
alias fk-bot="node n8n-skills/bot.js"
alias fk-audit="npm audit && node portability-check.js"
```

### Alias PowerShell

Ajouter à `$PROFILE`:

```powershell
# Frankito-IA aliases
function fk-check { node health-check.js }
function fk-port { node portability-check.js }
function fk-fix { node auto-fix.js }
function fk-rotate { node auto-rotate.js }
function fk-bot { node n8n-skills\bot.js }
```

---

## 🆘 Troubleshooting Rapide

### Problème: Bot ne démarre pas
```bash
# 1. Vérifier .env
cat .env

# 2. Health check
node health-check.js

# 3. Tester credentials manuellement
node -e "require('dotenv').config(); console.log('BOT_TOKEN:', process.env.TELEGRAM_BOT_TOKEN?.substring(0,10)+'...')"

# 4. Logs détaillés
DEBUG=* node n8n-skills/bot.js
```

### Problème: npm install échoue
```bash
# 1. Nettoyer cache
npm cache clean --force

# 2. Supprimer node_modules
rm -rf node_modules package-lock.json

# 3. Réinstaller
npm install

# 4. Si proxy
npm config set proxy http://proxy:8080
```

### Problème: Erreur permissions (Linux/Mac)
```bash
# Fix ownership
sudo chown -R $USER:$USER .

# Fix permissions scripts
chmod +x *.js

# Fix permissions .env
chmod 600 .env
```

---

## 📚 Références

### Documentation
- [README.md](README.md) - Vue d'ensemble
- [AUDIT-REPORT.md](AUDIT-REPORT.md) - Rapport d'audit complet
- [PORTABILITY-GUIDE.md](PORTABILITY-GUIDE.md) - Guide multi-OS
- [ROTATION-GUIDE.md](ROTATION-GUIDE.md) - Guide rotation credentials

### Scripts Disponibles
- `auto-fix.js` - Corrections automatiques
- `auto-rotate.js` - Rotation credentials automatisée
- `cleanup-final.js` - Nettoyage post-rotation
- `health-check.js` - Diagnostic système
- `portability-check.js` - Test portabilité

---

**Version:** 1.0.0
**Dernière mise à jour:** 2026-02-07

**💡 Tip:** Ajouter ce fichier à vos favoris pour un accès rapide aux commandes!
