# 🚀 Guide de Déploiement Frankito Bot

## 🎯 Objectif

Déployer automatiquement le bot Telegram sur le VPS avec PM2.

---

## ⚠️ Contraintes actuelles

- ❌ SSH bloqué (port 22 et 2222)
- ❌ Terminal web Hostinger gèle
- ❌ API n8n retourne erreur 500
- ❌ Module `child_process` désactivé dans n8n

---

## ✅ Solutions disponibles

### 🥇 Solution 1 : Script automatique complet

**Fichier** : `scripts/auto-deploy-bot.sh`

**Avantages** :
- Déploiement complet automatisé
- Vérifications à chaque étape
- Logs colorés et détaillés
- Confirmation finale du statut "online"

**Comment l'utiliser** :

**A. Si vous avez SSH depuis votre machine locale :**
```bash
# Transférer le script
scp scripts/auto-deploy-bot.sh root@72.62.232.53:/root/

# Se connecter et exécuter
ssh root@72.62.232.53
bash /root/auto-deploy-bot.sh
```

**B. Via n8n (si Execute Command activé) :**
```bash
# Dans un node Execute Command de n8n
curl -o /tmp/deploy.sh https://raw.githubusercontent.com/[VOTRE-REPO]/auto-deploy-bot.sh
chmod +x /tmp/deploy.sh
bash /tmp/deploy.sh
```

**C. Copier-coller le contenu du script dans le terminal Hostinger**

---

### 🥈 Solution 2 : One-liner ultra-compact

**Fichier** : `DEPLOY-ONELINER.txt`

**Avantages** :
- Une seule commande
- Copier-coller facile
- Fonctionne même si le terminal gèle après

**Comment l'utiliser** :

Ouvrez `DEPLOY-ONELINER.txt`, copiez TOUT le contenu, collez dans le terminal Hostinger et appuyez sur Entrée.

La commande va :
1. Créer le répertoire
2. Créer bot.js
3. Créer package.json
4. Installer telegraf
5. Lancer avec PM2
6. Sauvegarder PM2
7. Afficher le statut
8. Confirmer si "online"

---

### 🥉 Solution 3 : Workflow n8n (si Execute Command activé)

**Fichier** : `n8n-workflows/REPAIR-SSH-NATIVE.json`

**Prérequis** :
```bash
export N8N_ENABLE_EXECUTE_COMMAND=true
pm2 restart n8n  # ou systemctl restart n8n
```

Puis importez le workflow et exécutez-le.

---

## 📋 Commandes de vérification post-déploiement

```bash
# Statut PM2
pm2 list

# Logs en temps réel
pm2 logs frankito-bot

# Logs des 20 dernières lignes
pm2 logs frankito-bot --lines 20 --nostream

# Vérifier que le bot est "online"
pm2 jlist | grep frankito-bot | grep online

# Redémarrer si nécessaire
pm2 restart frankito-bot

# Voir les détails du processus
pm2 describe frankito-bot
```

---

## 🧪 Tests dans Telegram

Une fois le bot déployé et en status **"online"** :

```
/start
→ 👋 Bienvenue sur Frankito Bot!

/ping
→ 🏓 Pong !

/help
→ 📖 Aide: [liste des commandes]
```

---

## 🔍 Troubleshooting

### Le bot ne démarre pas

```bash
# Voir les erreurs
pm2 logs frankito-bot --err --lines 50

# Vérifier que telegraf est installé
ls -la /root/frankito-bot/node_modules/telegraf

# Réinstaller si nécessaire
cd /root/frankito-bot
npm install --production
pm2 restart frankito-bot
```

### Le bot redémarre en boucle

```bash
# Vérifier les restarts
pm2 list

# Si beaucoup de restarts, voir les erreurs
pm2 logs frankito-bot --err

# Problème courant: mauvais token
# Éditer bot.js avec le bon token
nano /root/frankito-bot/bot.js
pm2 restart frankito-bot
```

### PM2 pas installé

```bash
npm install -g pm2
```

### Node.js pas installé

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Vérifier
node --version
npm --version
```

---

## 📊 Résumé

| Méthode | Complexité | Probabilité succès | Prérequis |
|---------|------------|-------------------|-----------|
| **Script auto** | ⭐⭐⭐ | 🟢 95% | Accès terminal/SSH |
| **One-liner** | ⭐ | 🟢 90% | Accès terminal |
| **Workflow n8n** | ⭐⭐ | 🟡 70% | Execute Command activé |

---

## 🎯 Recommandation

**Si le terminal Hostinger fonctionne ne serait-ce que 30 secondes** :

➡️ Utilisez le **One-liner** (`DEPLOY-ONELINER.txt`)

C'est la solution la plus rapide et la plus fiable.

---

## ✅ Confirmation de succès

Le déploiement est réussi quand vous voyez :

```
┌─────┬───────────────┬─────────┬─────────┬───────┐
│ id  │ name          │ status  │ restart │ uptime│
├─────┼───────────────┼─────────┼─────────┼───────┤
│ 0   │ frankito-bot  │ online  │ 0       │ 5s    │
└─────┴───────────────┴─────────┴─────────┴───────┘

✅ BOT STATUS: ONLINE
```

Et le bot répond dans Telegram !

---

**Créé par** : Claude Code
**Date** : 2026-02-06
**Version** : 1.0 - Déploiement automatique
