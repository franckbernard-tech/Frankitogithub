# 🤖 Bots - Frankito-IA

Ce dossier centralise les scripts de bots Telegram et autres automations.

## 📂 Structure

### Bot Telegram Principal
- **Location:** `../n8n-skills/bot.js`
- **Description:** Bot Telegram principal connecté à N8N
- **Démarrage:** `cd ../n8n-skills && node bot.js`
- **Dependencies:** Installées dans `../n8n-skills/node_modules/`

### Bot Telegram Legacy
- **Location:** `../n8n-skills/telegram-bot.js`
- **Description:** Version legacy du bot Telegram
- **Statut:** Archived

## 🚀 Utilisation

### Démarrer le bot principal
```bash
# Depuis la racine du projet
node n8n-skills/bot.js

# Ou depuis n8n-skills/
cd n8n-skills
node bot.js
```

### Configuration
Le bot utilise la configuration centralisée dans `config.js` à la racine, qui charge automatiquement les variables d'environnement depuis `.env`.

**Variables requises:**
- `TELEGRAM_BOT_TOKEN` - Token du bot Telegram
- `AUTHORIZED_CHAT_ID` - ID du chat autorisé
- `N8N_API_URL` - URL de l'instance N8N
- `N8N_API_KEY` - Clé API N8N

## 📝 Notes

Les bots restent dans `n8n-skills/` pour maintenir la compatibilité avec:
- Les dépendances Node.js installées (`node_modules/`)
- Le `package.json` configuré
- Les chemins relatifs vers `config.js`

Ce dossier `/bots/` sert de point d'entrée documenté et peut contenir des scripts wrapper ou des configurations futures.

## 🔗 Fichiers Liés

- Configuration: `../config.js`
- Environment: `../.env`
- Health Check: `../health-check.js`
- Documentation: `../docs/`

---
**Version:** 1.0.0
**Dernière mise à jour:** 2026-02-07
