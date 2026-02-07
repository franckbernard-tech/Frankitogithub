# Déploiement du Bot Telegram MoltBot

## Modifications apportées

Le bot MoltBot a été modifié pour créer automatiquement des workflows n8n via l'API, sans demander de configuration à l'utilisateur.

### Nouvelles fonctionnalités

✨ **Création automatique de workflows**
- Le bot détecte automatiquement quand vous demandez de créer un workflow
- Il utilise directement l'API n8n configurée dans le code
- Plus besoin de fournir de clé API ou d'accès Chrome

### Types de workflows supportés

Le bot peut créer automatiquement ces types de workflows:

| Type | Mots-clés | Description |
|------|-----------|-------------|
| **RSS** | `rss`, `flux`, `veille` | Workflow de veille RSS avec agrégation |
| **Webhook** | `webhook`, `api` | Endpoint API personnalisé |
| **Email** | `email`, `mail`, `courriel` | Automatisation d'envoi d'emails |
| **Schedule** | `schedule`, `planifié`, `cron` | Tâche planifiée périodique |
| **Slack** | `slack`, `notification` | Notifications Slack automatiques |
| **Générique** | (autre) | Workflow de base avec trigger manuel |

### Exemples d'utilisation

```
/n8n créer un workflow de veille RSS
→ Crée un workflow RSS automatiquement

/n8n créer un webhook API
→ Crée un endpoint webhook

/n8n créer une tâche planifiée
→ Crée un workflow avec schedule trigger

/n8n créer un workflow email
→ Crée un workflow d'automatisation email
```

## Déploiement sur VPS

### Option 1: Script PowerShell (Windows)

```powershell
# Avec paramètres
.\scripts\deploy_bot.ps1 -VpsHost "IP_OR_HOSTNAME" -VpsUser "USERNAME"

# Avec variables d'environnement
$env:VPS_HOST = "123.45.67.89"
$env:VPS_USER = "root"
.\scripts\deploy_bot.ps1
```

### Option 2: Script Bash (Linux/Mac)

```bash
# Avec paramètres
./scripts/deploy_bot.sh IP_OR_HOSTNAME USERNAME

# Avec variables d'environnement
export VPS_HOST="123.45.67.89"
export VPS_USER="root"
./scripts/deploy_bot.sh
```

### Option 3: Déploiement manuel

1. **Copier le fichier bot.js sur le VPS:**
   ```bash
   scp n8n-skills/bot.js USER@VPS_HOST:/path/to/bot/
   ```

2. **Copier le fichier .env (optionnel):**
   ```bash
   scp .env USER@VPS_HOST:/path/to/bot/
   ```

3. **Se connecter au VPS:**
   ```bash
   ssh USER@VPS_HOST
   ```

4. **Redémarrer le service bot:**
   ```bash
   # Avec PM2
   pm2 restart frankito-bot
   # ou
   pm2 restart bot

   # Avec systemd
   systemctl restart frankito-bot

   # Manuellement
   cd /path/to/bot
   node bot.js
   ```

## Configuration API n8n

Le bot utilise ces paramètres pour se connecter à n8n:

```javascript
N8N_API_URL = https://n8n.srv1289936.hstgr.cloud
N8N_API_KEY = eyJhbGc... (clé JWT)
```

Ces paramètres peuvent être:
- Définis dans le code (par défaut)
- Surchargés via variables d'environnement `.env`

### Fichier .env (optionnel)

Si vous voulez utiliser d'autres credentials, créez un fichier `.env`:

```env
# Configuration N8N
N8N_API_URL=https://votre-instance.n8n.cloud
N8N_API_KEY=votre_cle_api_jwt

# Configuration Telegram
TELEGRAM_BOT_TOKEN=votre_token_telegram
```

## Vérification du déploiement

### 1. Vérifier que le service tourne

```bash
# Avec PM2
ssh USER@VPS_HOST 'pm2 status'

# Avec systemd
ssh USER@VPS_HOST 'systemctl status frankito-bot'
```

### 2. Consulter les logs

```bash
# Avec PM2
ssh USER@VPS_HOST 'pm2 logs frankito-bot'

# Logs système
ssh USER@VPS_HOST 'journalctl -u frankito-bot -f'
```

### 3. Tester le bot

Envoyez un message au bot sur Telegram:

```
/ping
→ Le bot doit répondre "🏓 Pong! Le bot est actif."

/help
→ Le bot affiche la liste des commandes

/n8n créer un workflow de test
→ Le bot crée un workflow et vous donne le lien
```

## Troubleshooting

### Le bot ne démarre pas

1. Vérifier les logs: `pm2 logs frankito-bot`
2. Vérifier les dépendances: `cd /path/to/bot && npm install`
3. Vérifier le fichier .env (si utilisé)
4. Vérifier que le token Telegram est valide

### Le bot ne crée pas de workflows

1. Vérifier la configuration API n8n dans le code
2. Tester la connexion à l'API:
   ```bash
   curl -H "X-N8N-API-KEY: YOUR_KEY" https://n8n.srv1289936.hstgr.cloud/api/v1/workflows
   ```
3. Vérifier les logs pour les erreurs d'API

### Le service ne redémarre pas automatiquement

Si le script de déploiement ne peut pas redémarrer automatiquement:

```bash
# Se connecter au VPS
ssh USER@VPS_HOST

# Aller dans le dossier du bot
cd /root/frankito-bot  # ou votre chemin

# Redémarrer avec PM2
pm2 restart bot

# Si PM2 n'est pas configuré
pm2 start bot.js --name frankito-bot

# Sauvegarder la config PM2
pm2 save
pm2 startup
```

## Architecture mise à jour

```
┌─────────────────┐
│  User Telegram  │
└────────┬────────┘
         │ /n8n créer un workflow RSS
         ▼
┌─────────────────┐
│   MoltBot       │
│   (bot.js)      │
├─────────────────┤
│ • Détecte type  │
│ • Génère config │
│ • Appelle API   │
└────────┬────────┘
         │ POST /api/v1/workflows
         ▼
┌─────────────────┐
│  n8n Instance   │
│  (Hostinger)    │
├─────────────────┤
│ • Crée workflow │
│ • Retourne ID   │
└────────┬────────┘
         │ Workflow créé: ID, URL
         ▼
┌─────────────────┐
│  User Telegram  │
│  ✅ Workflow    │
│  🔗 Lien direct │
└─────────────────┘
```

## Support

Pour plus d'informations:
- [CLAUDE.md](../CLAUDE.md) - Documentation principale
- [règles du jeu](../règles%20du%20jeu-%20automatisation%20N8N.md) - Principes et règles
- [n8n Documentation](https://docs.n8n.io/api/)

---

**Version:** 2.0
**Date:** 2026-02-06
**Auteur:** Claude Code
