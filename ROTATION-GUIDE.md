# 🔐 Guide de Rotation des Credentials - Frankito-IA

## 🎯 Contexte

Suite à l'exposition accidentelle de credentials sur GitHub, ce guide vous accompagne dans la rotation sécurisée de vos clés API.

## ⚡ Processus Rapide (5 minutes)

### Étape 1 : Rotation Interactive

```bash
node rotate-credentials.js
```

Le script va :
- ✅ Vous demander votre nouveau token Telegram
- ✅ Le valider immédiatement via l'API Telegram
- ✅ Vous demander votre nouvelle clé N8N
- ✅ La valider immédiatement via votre instance N8N
- ✅ Créer un backup de `.env` (`.env.backup`)
- ✅ Mettre à jour `.env` avec les nouvelles credentials
- ✅ Lancer automatiquement le health-check
- ✅ Afficher le résultat et les prochaines étapes

### Étape 2 : Nettoyage Final

```bash
node cleanup-final.js
```

Le script va :
- ✅ Vérifier que les nouvelles credentials sont actives
- ✅ Supprimer le dossier `archive/` (contient anciennes credentials)
- ✅ Nettoyer les fichiers temporaires
- ✅ Vérifier l'état Git
- ✅ Proposer les commandes pour le commit final

### Étape 3 : Commit de Sécurisation

```bash
git add .env.template .gitignore config.js health-check.js rotate-credentials.js cleanup-final.js
git commit -m "chore: secure credentials with centralized config and rotation tools"
```

## 📋 Prérequis

### Pour le Token Telegram

1. Ouvrez Telegram
2. Recherchez `@BotFather`
3. Commandes :
   ```
   /mybots
   [Sélectionnez votre bot]
   API Token > Revoke current token
   ```
4. **Copiez le nouveau token affiché**

### Pour la Clé N8N

1. Ouvrez https://n8n.srv1289936.hstgr.cloud
2. Connectez-vous
3. Menu : Avatar > Settings > API
4. **Supprimez l'ancienne clé** (se termine par `...TjMZDacb9T_g44VPQ_jI`)
5. Cliquez "Create API Key"
6. Label : `Frankito-IA - Production`
7. **Copiez la clé affichée** (ne sera plus jamais affichée)

## 🔍 Diagnostic de Santé

À tout moment, vérifiez l'état de votre système :

```bash
node health-check.js
```

Résultat attendu :
```
✅ Fichier .env
✅ Configuration
✅ Connexion N8N
✅ Workflow Master
✅ Bot Telegram

✅ SYSTÈME OPÉRATIONNEL
```

## 🛡️ Sécurité

### Fichiers JAMAIS à commiter

- `.env` ❌
- `.env.backup` ❌
- `secrets.txt` ❌
- `*credentials*.json` ❌

### Fichiers sûrs à commiter

- `.env.template` ✅
- `config.js` ✅
- `health-check.js` ✅
- `rotate-credentials.js` ✅
- `cleanup-final.js` ✅
- `.gitignore` ✅

## ⚠️ En cas de problème

### "Token invalide" lors de la rotation

**Problème :** Le token Telegram n'est pas reconnu

**Solutions :**
1. Vérifiez que vous avez copié le token complet (format : `1234567890:ABCdef...`)
2. Vérifiez qu'il n'y a pas d'espaces avant/après
3. Le token doit faire ~45 caractères
4. Revérifiez dans @BotFather

### "API Key invalide" lors de la rotation

**Problème :** La clé N8N n'est pas reconnue

**Solutions :**
1. Vérifiez que la clé est complète (très longue, ~200+ caractères)
2. Vérifiez que vous l'avez bien créée dans N8N > Settings > API
3. Vérifiez que l'URL N8N est correcte : `https://n8n.srv1289936.hstgr.cloud`
4. Essayez de créer une nouvelle clé

### Health-check échoue après rotation

**Problème :** Le diagnostic détecte des erreurs

**Solutions :**
1. Relancez : `node health-check.js` pour voir les détails
2. Vérifiez que `.env` contient bien les nouvelles valeurs
3. Restaurez le backup si nécessaire : `cp .env.backup .env`
4. Relancez la rotation : `node rotate-credentials.js`

## 🧹 Nettoyage Historique Git (Avancé)

⚠️ **OPTIONNEL** - Seulement si vous voulez nettoyer l'historique Git

### Méthode recommandée : BFG Repo-Cleaner

```bash
# 1. Backup complet
git clone --mirror . ../frankito-backup.git

# 2. Créer fichier de secrets
cat > secrets.txt << 'EOF'
8510817329:AAE72JsuTE_r-sAnclrNN5APE1wIDeKKGXE
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4YWVhYjY1Ny04ZDU0LTRmYTQtYWYzYi0zYzQzODM3ZWY0MWMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiMTAwMGM1OGEtZGVjNC00NDdkLTg2NDUtMjJlZDdlMGE2NDMxIiwiaWF0IjoxNzcwNDA0NDU4fQ.hyPpsCqbfe4wwgR96wlghcketUvOhCaBjGE6Rb3omok
EOF

# 3. Installer BFG (Windows avec Chocolatey)
choco install bfg

# 4. Nettoyer
bfg --replace-text secrets.txt

# 5. Finaliser
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 6. Vérifier
git log --all --full-history -S "8510817329" --pretty=format:"%H %s"
# (devrait être vide)

# 7. Force push (si remote existe)
git push --force --all
```

## 📞 Support

En cas de blocage :
1. Vérifiez ce guide
2. Relancez `node health-check.js` pour diagnostiquer
3. Consultez le rapport d'audit complet

---

**Dernière mise à jour :** 2026-02-07
**Version :** 1.0.0
