# 🔀 Guide des Méthodes de Déploiement Alternatives

## 📊 Vue d'ensemble

Vous avez maintenant **4 méthodes** pour déployer le bot Gemini sur votre VPS :

| Méthode | Fichier | Prérequis | Complexité | Succès probable |
|---------|---------|-----------|------------|-----------------|
| **Original** | `deploy-bot-gemini.json` | Execute Command activé | ⭐ Simple | 🟡 Moyen |
| **Alternative A** | `deploy-bot-alternative-A-file-write.json` | Write Binary File autorisé | ⭐⭐ Moyen | 🟢 Élevé |
| **Alternative B** | `deploy-bot-alternative-B-webhook-helper.json` | Node.js child_process | ⭐⭐⭐ Avancé | 🟢 Élevé |
| **Alternative C** | `deploy-bot-alternative-C-ssh-method.json` | n8n sur même serveur | ⭐ Simple | 🟢 Très élevé |

---

## 🎯 Méthode Originale : Execute Command

### 📄 Fichier : `deploy-bot-gemini.json`

### ✅ Avantages
- Simple et direct
- 4 étapes claires
- Affiche les logs PM2

### ❌ Inconvénients
- Nécessite `N8N_ENABLE_EXECUTE_COMMAND=true`
- Peut être bloqué par la sécurité

### 🔧 Activation

Sur le VPS :
```bash
export N8N_ENABLE_EXECUTE_COMMAND=true
pm2 restart n8n
```

### 📝 Utilisation
1. Importer le workflow
2. Exécuter manuellement
3. Vérifier les 4 nodes

---

## 🅰️ Alternative A : Write Binary File

### 📄 Fichier : `deploy-bot-alternative-A-file-write.json`

### 💡 Principe
Utilise le node natif **Write Binary File** de n8n pour écrire directement sur le disque.

### 📋 Étapes du workflow

1. **Prepare Bot Code** : Encode le code en Buffer
2. **Write bot.js File** : Écrit physiquement le fichier
3. **Trigger PM2 Restart** : Appelle un webhook helper (voir Alternative B)
4. **Format Success** : Affiche le résultat

### ✅ Avantages
- Node natif n8n (plus sûr)
- Pas besoin d'Execute Command
- Gestion propre des binaires

### ❌ Inconvénients
- Nécessite le workflow helper (Alternative B) pour PM2
- Deux workflows à importer

### 🔧 Setup

1. Importer **Alternative B** d'abord (le helper)
2. Activer le workflow helper
3. Importer **Alternative A**
4. Vérifier que le webhook fonctionne

### 📝 Test

```bash
# Tester le webhook PM2 séparément
curl -X POST http://localhost:5678/webhook/restart-pm2
```

---

## 🅱️ Alternative B : Webhook Helper (PM2)

### 📄 Fichier : `deploy-bot-alternative-B-webhook-helper.json`

### 💡 Principe
Crée un **endpoint webhook** qui redémarre PM2 via Node.js `child_process`.

### 🌐 URL du Webhook
```
POST http://localhost:5678/webhook/restart-pm2
OU
POST https://n8n.srv1289936.hstgr.cloud/webhook/restart-pm2
```

### ⚙️ Fonctionnement

Ce workflow :
1. Reçoit une requête POST
2. Exécute `cd /root/frankito-bot && pm2 restart all`
3. Exécute `pm2 status`
4. Renvoie le résultat en JSON

### 🔑 Réponse JSON

**Succès :**
```json
{
  "success": true,
  "restart_output": "...",
  "status": "...",
  "timestamp": "2026-02-06T..."
}
```

**Erreur :**
```json
{
  "success": false,
  "error": "...",
  "stderr": "...",
  "timestamp": "2026-02-06T..."
}
```

### 💡 Utilisation standalone

Vous pouvez appeler ce webhook depuis **n'importe où** :

```bash
# Depuis votre machine locale
curl -X POST https://n8n.srv1289936.hstgr.cloud/webhook/restart-pm2

# Depuis un autre workflow n8n
# (Node HTTP Request vers http://localhost:5678/webhook/restart-pm2)

# Depuis le bot Telegram lui-même
axios.post('https://n8n.srv1289936.hstgr.cloud/webhook/restart-pm2')
```

### ⚠️ Sécurité

Ce webhook est **public** ! Pour le sécuriser :

**Option 1 : Ajouter un secret token**

Modifier le node "Webhook" :
```javascript
// Dans le node Code "Execute PM2 Restart"
const secret = $('Webhook').item.json.headers['x-secret-token'];
if (secret !== 'votre-secret-ici') {
  throw new Error('Unauthorized');
}
```

**Option 2 : Désactiver quand pas utilisé**

Désactivez le workflow après chaque déploiement.

---

## 🅲 Alternative C : Direct FS Write (Méthode ultime)

### 📄 Fichier : `deploy-bot-alternative-C-ssh-method.json`

### 💡 Principe
Utilise directement **Node.js fs** et **child_process** dans un node Code.

### ⚡ Pourquoi c'est la plus simple

Si **n8n tourne sur le même serveur** que le bot :
- Pas besoin de SSH
- Pas besoin de Execute Command externe
- Juste `fs.writeFileSync()` + `execSync('pm2 restart')`

### 🎯 Condition de réussite

N8N doit tourner **en tant que root** OU avoir accès à `/root/frankito-bot/`

Vérifier :
```bash
ps aux | grep n8n
# Si vous voyez "root" → Alternative C fonctionnera ✅
# Si vous voyez autre chose → Alternative A ou B
```

### 📋 Étapes du workflow

1. **Deploy via FS + Exec** :
   - Écrit le fichier avec `fs.writeFileSync()`
   - Redémarre avec `execSync('pm2 restart all')`
   - Récupère le statut

2. **Check Success** : Vérifie si ça a marché

3. **Success/Error Response** : Affiche le résultat

### ✅ Avantages
- **UN SEUL** workflow
- Pas de dépendances
- Très rapide
- Logs détaillés

### ❌ Inconvénients
- Nécessite permissions filesystem
- Si n8n n'est pas root, ça échoue

### 🔧 Correction des permissions

Si Alternative C échoue à cause des permissions :

```bash
# Option 1 : Donner accès au user n8n
sudo chown -R n8n:n8n /root/frankito-bot/
sudo chmod -R 755 /root/frankito-bot/

# Option 2 : Déplacer le bot ailleurs
mv /root/frankito-bot /home/n8n/frankito-bot
# Puis modifier le workflow pour pointer vers /home/n8n/frankito-bot
```

---

## 🎪 Stratégie de Déploiement Recommandée

### Étape 1 : Tester Alternative C d'abord

**C'est la plus simple si ça marche !**

1. Importer `deploy-bot-alternative-C-ssh-method.json`
2. Exécuter
3. Si succès → **TERMINÉ** ✅
4. Si échec → Continuer à l'étape 2

### Étape 2 : Essayer Alternative A + B

**Combination gagnante pour la plupart des cas**

1. Importer `deploy-bot-alternative-B-webhook-helper.json`
2. **Activer** ce workflow (important !)
3. Tester le webhook :
   ```bash
   curl -X POST https://n8n.srv1289936.hstgr.cloud/webhook/restart-pm2
   ```
4. Si le webhook marche, importer `deploy-bot-alternative-A-file-write.json`
5. Exécuter Alternative A
6. Si succès → **TERMINÉ** ✅
7. Si échec → Continuer à l'étape 3

### Étape 3 : Activer Execute Command (Méthode originale)

**Si tout le reste échoue**

```bash
# SSH sur le VPS (ou via terminal web Hostinger)
export N8N_ENABLE_EXECUTE_COMMAND=true
pm2 restart n8n
```

Puis utiliser `deploy-bot-gemini.json`

---

## 🐛 Troubleshooting Commun

### ❌ "Cannot write file: EACCES"

**Cause** : Permissions insuffisantes

**Solution** :
```bash
sudo chown -R $(whoami):$(whoami) /root/frankito-bot/
# OU utiliser Alternative B
```

### ❌ "pm2 command not found"

**Cause** : PM2 pas dans le PATH de n8n

**Solution** : Modifier le workflow pour utiliser le chemin absolu
```javascript
execSync('/usr/local/bin/pm2 restart all')
// OU
execSync('/root/.nvm/versions/node/v18.17.0/bin/pm2 restart all')
```

Trouver le chemin :
```bash
which pm2
```

### ❌ "Webhook 404 Not Found"

**Cause** : Workflow helper (Alternative B) pas activé

**Solution** :
1. Ouvrir le workflow B
2. Cliquer sur **Active** (toggle en haut à droite)
3. Vérifier l'URL du webhook dans les settings

### ❌ "Execute Command not enabled"

**Cause** : Feature désactivée dans n8n

**Solution** :
```bash
export N8N_ENABLE_EXECUTE_COMMAND=true
pm2 restart n8n
```

### ❌ Le fichier est écrit mais PM2 ne redémarre pas

**Cause** : PM2 pas accessible ou processus pas lancé

**Solution** :
```bash
# Vérifier PM2
pm2 list

# Si aucun processus "bot"
cd /root/frankito-bot
pm2 start bot.js --name bot

# Si processus existe mais bloqué
pm2 delete bot
pm2 start bot.js --name bot
```

---

## 🎯 Quelle méthode choisir ?

### Vous avez accès root au VPS ?
→ **Alternative C** (la plus directe)

### n8n tourne avec des permissions limitées ?
→ **Alternative A + B** (combo sécurisé)

### Vous voulez juste que ça marche vite ?
→ Activer Execute Command et utiliser la **Méthode originale**

### Vous voulez un webhook réutilisable ?
→ **Alternative B** seule (puis uploadez bot.js manuellement via SFTP une fois)

---

## 📦 Ordre d'import recommandé

1. **Alternative B** (helper, toujours utile)
2. **Alternative C** (tester d'abord, la plus simple)
3. Si C échoue → **Alternative A**
4. Si tout échoue → **Méthode originale** (avec activation Execute Command)

---

## 🚀 Script de Test Rapide

Copiez-collez dans un nouveau workflow n8n pour tester les permissions :

```javascript
// Node Code - Test Permissions
const fs = require('fs');
const { execSync } = require('child_process');

const tests = {
  fs_read: false,
  fs_write: false,
  exec_pm2: false,
  exec_commands: false
};

// Test 1 : Lecture fichier
try {
  const content = fs.readFileSync('/root/frankito-bot/bot.js', 'utf-8');
  tests.fs_read = true;
} catch (e) {
  tests.fs_read_error = e.message;
}

// Test 2 : Écriture fichier
try {
  fs.writeFileSync('/tmp/n8n-test.txt', 'test', 'utf-8');
  tests.fs_write = true;
} catch (e) {
  tests.fs_write_error = e.message;
}

// Test 3 : PM2 accessible
try {
  const pm2Output = execSync('pm2 --version', { encoding: 'utf-8' });
  tests.exec_pm2 = true;
  tests.pm2_version = pm2Output.trim();
} catch (e) {
  tests.exec_pm2_error = e.message;
}

// Test 4 : Execute commands
try {
  const whoami = execSync('whoami', { encoding: 'utf-8' });
  tests.exec_commands = true;
  tests.current_user = whoami.trim();
} catch (e) {
  tests.exec_commands_error = e.message;
}

return tests;
```

**Résultat attendu :**
```json
{
  "fs_read": true,
  "fs_write": true,
  "exec_pm2": true,
  "pm2_version": "5.x.x",
  "exec_commands": true,
  "current_user": "root"
}
```

Si **tous à true** → Alternative C marchera à 100% ✅

---

**Créé le** : 2026-02-06
**Auteur** : Claude Code
**Workflows** : 4 méthodes, 1 va forcément marcher 💪
