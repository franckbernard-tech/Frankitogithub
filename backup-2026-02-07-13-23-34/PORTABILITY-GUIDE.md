# 🌍 Guide de Portabilité - Frankito-IA

Guide complet pour installer et exécuter Frankito-IA sur Windows, Linux et macOS.

---

## 📋 Table des Matières

1. [Prérequis](#prérequis)
2. [Installation Windows](#installation-windows)
3. [Installation Linux](#installation-linux)
4. [Installation macOS](#installation-macos)
5. [Validation de l'Installation](#validation-de-linstallation)
6. [Problèmes Courants](#problèmes-courants)
7. [Scripts Spécifiques par OS](#scripts-spécifiques-par-os)

---

## 🔧 Prérequis

### Communs à tous les OS

#### 1. Node.js (>= 16.x)
**Version recommandée:** Node.js 20.x LTS

**Vérifier la version:**
```bash
node --version
npm --version
```

**Installation:** https://nodejs.org/

#### 2. Git
**Vérifier:**
```bash
git --version
```

**Installation:** https://git-scm.com/

#### 3. Éditeur de texte
- VS Code (recommandé)
- Sublime Text
- Vim/Nano

---

## 💻 Installation Windows

### Option A: Installation Standard

#### 1. Installer Node.js
```powershell
# Télécharger depuis nodejs.org
# Ou avec winget (Windows 10+)
winget install OpenJS.NodeJS.LTS
```

#### 2. Cloner le projet
```powershell
cd C:\Users\VotreNom\Documents
git clone https://github.com/votre-org/Frankito-IA.git
cd Frankito-IA
```

#### 3. Installer les dépendances
```powershell
npm install
```

#### 4. Configuration
```powershell
# Copier le template .env
copy .env.template .env

# Éditer .env avec vos credentials
notepad .env
```

#### 5. Vérifier l'installation
```powershell
node portability-check.js
node health-check.js
```

### Option B: Installation avec WSL (Recommandé pour développeurs)

```bash
# Dans WSL (Ubuntu)
sudo apt update
sudo apt install nodejs npm git

# Suivre ensuite les instructions Linux ci-dessous
```

### Spécificités Windows

**PowerShell vs CMD:**
- Utilisez PowerShell (recommandé) ou Git Bash
- CMD a des limitations avec les scripts

**Line Endings:**
- Git doit être configuré pour CRLF → LF
```powershell
git config --global core.autocrlf true
```

**Permissions:**
- Pas besoin de `chmod +x` sur Windows
- Les scripts `.ps1` nécessitent une politique d'exécution:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 🐧 Installation Linux

### Ubuntu/Debian

#### 1. Installer Node.js
```bash
# Via NodeSource (version récente)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Vérifier
node --version
npm --version
```

#### 2. Cloner le projet
```bash
cd ~/Documents
git clone https://github.com/votre-org/Frankito-IA.git
cd Frankito-IA
```

#### 3. Installer les dépendances
```bash
npm install
```

#### 4. Configuration
```bash
# Copier le template
cp .env.template .env

# Éditer avec votre éditeur préféré
nano .env
# ou
vim .env
```

#### 5. Rendre les scripts exécutables
```bash
chmod +x *.js
chmod +x scripts/*.sh
```

#### 6. Vérifier l'installation
```bash
./portability-check.js
./health-check.js
```

### Fedora/RHEL/CentOS

```bash
# Installer Node.js
sudo dnf install nodejs npm

# Reste identique à Ubuntu
```

### Arch Linux

```bash
# Installer Node.js
sudo pacman -S nodejs npm

# Reste identique
```

### Spécificités Linux

**Permissions:**
- Scripts doivent avoir le flag exécutable (`chmod +x`)
- Shebang requis: `#!/usr/bin/env node`

**Sound (beep):**
- Le terminal beep (`\x07`) peut nécessiter:
```bash
# Activer le beep
sudo modprobe pcspkr
```

---

## 🍎 Installation macOS

### Avec Homebrew (Recommandé)

#### 1. Installer Homebrew
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### 2. Installer Node.js
```bash
brew install node
```

#### 3. Cloner le projet
```bash
cd ~/Documents
git clone https://github.com/votre-org/Frankito-IA.git
cd Frankito-IA
```

#### 4. Installer les dépendances
```bash
npm install
```

#### 5. Configuration
```bash
cp .env.template .env
nano .env
```

#### 6. Rendre les scripts exécutables
```bash
chmod +x *.js
chmod +x scripts/*.sh
```

#### 7. Vérifier l'installation
```bash
./portability-check.js
./health-check.js
```

### Spécificités macOS

**Permissions:**
- Identique à Linux (chmod +x, shebang)

**Zsh vs Bash:**
- macOS moderne utilise Zsh par défaut
- Les scripts `.sh` fonctionnent avec les deux

**Homebrew:**
- Package manager recommandé pour toutes les dépendances

---

## ✅ Validation de l'Installation

### 1. Test de Portabilité
```bash
node portability-check.js --verbose
```

**Résultat attendu:**
```
✅ Passed:   25/30
⚠️  Warnings: 5/30
❌ Errors:   0/30
🔴 Critical: 0/30

🎯 Score de Portabilité: 83%
```

### 2. Health Check
```bash
node health-check.js
```

**Résultat attendu:**
```
✅ Fichier .env
✅ Configuration
✅ Connexion N8N
✅ Workflow Master
✅ Bot Telegram

✅ SYSTÈME OPÉRATIONNEL
```

### 3. Test du Bot (optionnel)
```bash
node n8n-skills/bot.js
```

**Vérifier:**
- Pas d'erreur au démarrage
- Bot répond aux commandes Telegram
- Ctrl+C pour arrêter

---

## 🚨 Problèmes Courants

### Erreur: "Cannot find module 'dotenv'"

**Cause:** Dépendance manquante

**Solution:**
```bash
npm install dotenv
```

### Erreur: "Permission denied" (Linux/Mac)

**Cause:** Script pas exécutable

**Solution:**
```bash
chmod +x script.js
```

### Erreur: PowerShell Execution Policy (Windows)

**Cause:** Scripts PowerShell bloqués

**Solution:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Erreur: "ENOENT: no such file or directory"

**Cause:** Path incorrect ou fichier manquant

**Solutions:**
- Vérifier que vous êtes dans le bon répertoire
- Vérifier que le fichier existe
- Sur Windows, utiliser `\` ou `\\` dans les paths
- Sur Linux/Mac, utiliser `/`

### Erreur: "Invalid credentials" dans health-check

**Cause:** .env mal configuré ou credentials invalides

**Solution:**
```bash
# 1. Vérifier .env existe
ls -la .env

# 2. Vérifier le format
cat .env

# 3. Tester les credentials manuellement
node -e "require('dotenv').config(); console.log(process.env.TELEGRAM_BOT_TOKEN)"

# 4. Si nécessaire, rotation des credentials
node auto-rotate.js --from-file=new-creds.tmp
```

### Pas de son (beep) sur Linux

**Cause:** Module pcspkr désactivé

**Solution:**
```bash
sudo modprobe pcspkr
echo "pcspkr" | sudo tee -a /etc/modules
```

### npm install échoue

**Causes possibles:**
- Proxy réseau
- Version Node.js trop ancienne
- Permissions insuffisantes

**Solutions:**
```bash
# Vérifier version Node.js
node --version  # Doit être >= 16

# Nettoyer le cache npm
npm cache clean --force

# Réinstaller
rm -rf node_modules package-lock.json
npm install

# Si proxy réseau
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080
```

---

## 📝 Scripts Spécifiques par OS

### Windows Only

**Scripts PowerShell (.ps1):**
- `scripts/deploy_bot.ps1` - Déploiement bot

**Alternative cross-platform:**
- Utiliser les scripts Node.js équivalents quand disponibles

### Linux/Mac Only

**Scripts Shell (.sh):**
- `scripts/deploy_bot.sh` - Déploiement bot

**Sur Windows:**
- Utiliser WSL, Git Bash, ou équivalent PowerShell

### Scripts Universels

**Tous ces scripts fonctionnent sur tous les OS:**
- `config.js` - Configuration
- `health-check.js` - Diagnostic
- `auto-rotate.js` - Rotation credentials
- `portability-check.js` - Test portabilité
- `cleanup-final.js` - Nettoyage
- `n8n-skills/bot.js` - Bot Telegram

---

## 🔄 Migration Entre OS

### De Windows vers Linux/Mac

```bash
# 1. Cloner depuis Git (line endings automatiques)
git clone https://github.com/votre-org/Frankito-IA.git

# 2. Installer dépendances
npm install

# 3. Copier .env depuis Windows
# (Manuellement ou via transfer sécurisé)

# 4. Rendre scripts exécutables
chmod +x *.js scripts/*.sh

# 5. Valider
./portability-check.js
```

### De Linux/Mac vers Windows

```powershell
# 1. Cloner depuis Git
git clone https://github.com/votre-org/Frankito-IA.git

# 2. Installer dépendances
npm install

# 3. Copier .env
copy \\path\\to\\.env .env

# 4. Valider
node portability-check.js
```

### Problèmes de Line Endings

**Si scripts ne fonctionnent pas après migration:**

```bash
# Linux/Mac: Convertir CRLF → LF
find . -name "*.js" -exec dos2unix {} \;

# Ou avec sed
find . -name "*.js" -exec sed -i 's/\r$//' {} \;
```

```powershell
# Windows: Convertir LF → CRLF (rarement nécessaire)
# Node.js gère les deux automatiquement
```

---

## 🐳 Docker (Méthode Universelle)

**Pour portabilité maximale, utiliser Docker:**

### Dockerfile (à créer)

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["node", "n8n-skills/bot.js"]
```

### Utilisation

```bash
# Build
docker build -t frankito-ia .

# Run
docker run -it --env-file .env frankito-ia

# Avec compose
docker-compose up
```

**Avantages:**
- Environnement identique sur tous les OS
- Isolation complète
- Pas de conflit de dépendances

---

## 🛠️ Outils Recommandés

### Gestion de Versions Node.js

#### NVM (Linux/Mac)
```bash
# Installer NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Utiliser
nvm install 20
nvm use 20
```

#### NVM-Windows (Windows)
```powershell
# Télécharger depuis: https://github.com/coreybutler/nvm-windows
# Installer et utiliser:
nvm install 20
nvm use 20
```

#### Volta (Cross-platform)
```bash
# Installer Volta
curl https://get.volta.sh | bash

# Utiliser
volta install node@20
```

### Éditeurs Recommandés

**VS Code:**
- Extensions: ESLint, Prettier, EditorConfig
- Support multi-OS excellent
- Terminal intégré

**Configuration workspace (.vscode/settings.json):**
```json
{
  "files.eol": "\n",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

---

## ✅ Checklist de Setup

### Nouveau Développeur

- [ ] Node.js installé (>= 16)
- [ ] Git configuré
- [ ] Projet cloné
- [ ] `npm install` exécuté
- [ ] `.env` créé depuis `.env.template`
- [ ] Credentials ajoutées dans `.env`
- [ ] Scripts rendus exécutables (Linux/Mac)
- [ ] `portability-check.js` passé (score > 70%)
- [ ] `health-check.js` passé (✅ SYSTÈME OPÉRATIONNEL)
- [ ] Bot Telegram testé (commandes répondent)

### Nouveau Serveur de Production

- [ ] OS supporté (Ubuntu 20.04+ recommandé)
- [ ] Node.js LTS installé
- [ ] Git installé
- [ ] Projet déployé
- [ ] `.env` configuré avec credentials production
- [ ] Permissions correctes (chmod)
- [ ] Health-check validé
- [ ] Process manager configuré (PM2, systemd)
- [ ] Logs configurés
- [ ] Monitoring configuré
- [ ] Backups automatiques configurés

---

## 📞 Support

### Documentation
- [README.md](README.md) - Vue d'ensemble
- [ROTATION-GUIDE.md](ROTATION-GUIDE.md) - Rotation credentials
- [AUDIT-REPORT.md](AUDIT-REPORT.md) - Rapport d'audit complet

### Tests
```bash
# Portabilité
node portability-check.js --verbose

# Santé système
node health-check.js

# Test rotation (dry-run)
node test-rotation-ui.js
```

### Logs
```bash
# Logs du bot
tail -f logs/bot.log

# Logs N8N
# Via interface N8N
```

---

## 📊 Matrice de Compatibilité

| Feature | Windows | Linux | macOS | Docker |
|---------|---------|-------|-------|--------|
| Bot Telegram | ✅ | ✅ | ✅ | ✅ |
| Health Check | ✅ | ✅ | ✅ | ✅ |
| Auto-rotate | ✅ | ✅ | ✅ | ✅ |
| PowerShell beep | ✅ | ❌ | ❌ | ❌ |
| Shell scripts | ⚠️ * | ✅ | ✅ | ✅ |
| Portability check | ✅ | ✅ | ✅ | ✅ |

\* Requiert WSL ou Git Bash

---

## 🔐 Sécurité Multi-OS

### Permissions .env

**Linux/Mac:**
```bash
chmod 600 .env
```

**Windows:**
```powershell
icacls .env /inheritance:r /grant:r "$($env:USERNAME):(R,W)"
```

### Firewall

**Linux (ufw):**
```bash
sudo ufw allow 443/tcp  # HTTPS pour N8N
```

**macOS:**
```bash
# Gérer via Préférences Système > Sécurité > Firewall
```

**Windows:**
```powershell
New-NetFirewallRule -DisplayName "N8N HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow
```

---

**Version:** 1.0.0
**Dernière mise à jour:** 2026-02-07
**Testé sur:** Windows 11, Ubuntu 22.04, macOS 13+

**🎯 Prochaine étape:** Exécuter `node portability-check.js` pour valider votre setup!
