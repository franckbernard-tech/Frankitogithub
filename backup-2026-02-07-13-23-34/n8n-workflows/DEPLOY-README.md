# 🚀 Déploiement Bot Gemini via N8N

## 📋 Vue d'ensemble

Ce workflow permet de déployer le nouveau code ultra-court du bot Telegram directement sur le VPS via n8n, contournant le terminal web Hostinger inutilisable et SSH bloqué.

## 🎯 Workflow : `deploy-bot-gemini.json`

### Ce qu'il fait :

1. ✍️ **Écrit le nouveau bot.js** : Écrase `/root/frankito-bot/bot.js` avec le code Gemini
2. 🔄 **Redémarre PM2** : Relance tous les processus PM2
3. ✅ **Vérifie le statut** : Affiche l'état de PM2 après redémarrage
4. 📊 **Rapport** : Formate les résultats avec timestamp

### Différences avec l'ancien bot :

| Ancien (502 lignes) | Nouveau (54 lignes) |
|---------------------|---------------------|
| Templates complexes | Structure minimaliste |
| Détection automatique | Workflow simple |
| Gestion d'erreurs avancée | Gestion basique |
| Multiples commandes | Focus sur `/n8n` |
| Enregistrement chat_ids | Pas de persistence |

## 📥 Import dans N8N

### Méthode 1 : Via l'interface web

1. Ouvrez votre instance n8n : https://n8n.srv1289936.hstgr.cloud
2. Cliquez sur **Workflows** (menu gauche)
3. Cliquez sur **Import from File** ou **Import from URL**
4. Sélectionnez `deploy-bot-gemini.json`
5. Cliquez sur **Import**

### Méthode 2 : Via l'API (si besoin)

```bash
curl -X POST "https://n8n.srv1289936.hstgr.cloud/api/v1/workflows" \
  -H "X-N8N-API-KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d @deploy-bot-gemini.json
```

## ▶️ Exécution

### Dans l'interface N8N :

1. Ouvrez le workflow importé
2. Cliquez sur **Execute Workflow** (bouton en haut à droite)
3. Attendez l'exécution complète (4 étapes)
4. Vérifiez le résultat dans le node "Format Success"

### Résultat attendu :

```json
{
  "status": "✅ Déploiement réussi",
  "file": "/root/frankito-bot/bot.js",
  "pm2_output": "┌─────┬──────┬─────────┬─────────┬─────────┐\n│ id  │ name │ status  │ restart │ uptime  │\n├─────┼──────┼─────────┼─────────┼─────────┤\n│ 0   │ bot  │ online  │ 15      │ 2s      │\n└─────┴──────┴─────────┴─────────┴─────────┘",
  "timestamp": "2026-02-06T..."
}
```

## ⚠️ Points d'attention

### Permissions requises

Le workflow utilise **Execute Command** qui nécessite :
- Accès système via n8n
- Droits d'écriture sur `/root/frankito-bot/`
- Droits d'exécution de `pm2`

### Si Execute Command est bloqué

Si n8n bloque l'exécution de commandes système, alternatives :

**Option A : Activer les Execute Command**
```bash
# Sur le VPS, dans la config n8n
export N8N_ENABLE_EXECUTE_COMMAND=true
pm2 restart n8n
```

**Option B : Utiliser HTTP Request + API locale**
Créer un endpoint local qui accepte le code et l'écrit sur disque.

**Option C : SFTP/FTP Node**
Utiliser un node SFTP pour uploader le fichier (requiert config SFTP).

## 🧪 Test du bot après déploiement

1. **Test Telegram** :
   ```
   /start
   /n8n test de création
   ```

2. **Vérifier les logs PM2** :
   ```bash
   pm2 logs bot
   ```

3. **Vérifier que le workflow est créé** :
   - Allez sur https://n8n.srv1289936.hstgr.cloud
   - Vérifiez la liste des workflows
   - Un workflow `Auto-[timestamp]` devrait apparaître

## 🐛 Troubleshooting

### Le workflow échoue à "Write bot.js to disk"

**Cause** : Execute Command désactivé ou n8n n'a pas les droits

**Solution** :
```bash
# Sur le VPS
sudo chown -R n8n:n8n /root/frankito-bot/
# OU
export N8N_ENABLE_EXECUTE_COMMAND=true
pm2 restart n8n
```

### PM2 restart échoue

**Cause** : PM2 pas trouvé dans le PATH de n8n

**Solution** :
```bash
# Modifier le node "Restart PM2" pour utiliser le chemin absolu
/usr/local/bin/pm2 restart all
# OU
/root/.nvm/versions/node/v*/bin/pm2 restart all
```

### Le bot ne répond pas après déploiement

**Cause** : Erreur dans le code déployé

**Solution** :
```bash
pm2 logs bot --lines 50
# Vérifier les erreurs
```

## 📊 Monitoring

### Ajouter une notification Telegram

Ajoutez un node **Telegram** à la fin du workflow :

```javascript
// Node Telegram (après Format Success)
{
  "chatId": "673173233",
  "text": "✅ Bot Gemini déployé!\n\nStatut: {{ $json.status }}\nTimestamp: {{ $json.timestamp }}"
}
```

### Logs PM2 persistants

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

## 🔐 Sécurité

⚠️ **IMPORTANT** : Ce workflow contient des tokens et clés en dur :

- `BOT_TOKEN` : Token Telegram du bot
- `N8N_KEY` : Clé API n8n

**Recommandations** :
1. Ne pas commiter ce workflow sur un repo public
2. Utiliser des variables d'environnement sur le VPS :
   ```bash
   # Sur le VPS
   echo "export TELEGRAM_BOT_TOKEN='8510817329:AAE...'" >> ~/.bashrc
   echo "export N8N_API_KEY='eyJhbGc...'" >> ~/.bashrc
   source ~/.bashrc
   ```

3. Modifier bot.js pour utiliser `process.env` :
   ```javascript
   const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8510817329:AAE...';
   const N8N_KEY = process.env.N8N_API_KEY || 'eyJhbGc...';
   ```

## 🎯 Next Steps

Une fois le déploiement réussi :

1. ✅ Tester le bot avec `/n8n test`
2. 📝 Vérifier qu'un workflow est créé dans n8n
3. 🔧 Ajuster le code si nécessaire
4. 🔄 Relancer ce workflow pour redéployer
5. 📊 Monitorer les logs PM2

## 🆘 Support

Si rien ne fonctionne, dernière option nucléaire :

```bash
# Depuis n8n, créer un workflow avec HTTP Request
# qui uploade via l'API d'un service externe (Gist, Pastebin)
# puis utilise wget pour télécharger sur le VPS
wget -O /root/frankito-bot/bot.js https://gist.githubusercontent.com/...
pm2 restart all
```

---

**Créé le** : 2026-02-06
**Auteur** : Claude Code + Gemini
**Version** : 1.0 - Ultra-court
