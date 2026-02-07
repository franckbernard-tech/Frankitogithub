# ⚡ Quick Start - Rotation en 1 Commande

## 🎯 Rotation Automatique (Recommandé)

### Option A : Fichier Temporaire (Plus Sûr)

```bash
# 1. Créer le fichier avec vos nouveaux tokens
echo "TELEGRAM_BOT_TOKEN=votre_nouveau_token_telegram" > new-creds.tmp
echo "N8N_API_KEY=votre_nouvelle_cle_n8n" >> new-creds.tmp

# 2. Lancer la rotation (TOUT est automatique)
node auto-rotate.js --from-file=new-creds.tmp
```

**Résultat :**
```
✅ Token Telegram validé : @YourBot
✅ N8N API Key validée : 12 workflows
✅ .env mis à jour (backup: .env.backup)
✅ Health-check : SYSTÈME OPÉRATIONNEL
✅ Archive/ supprimée

📋 COMMANDE FINALE :
git add ... && git commit -m "..."
```

Le fichier `new-creds.tmp` est **automatiquement supprimé** après rotation.

---

### Option B : Arguments CLI (Plus Rapide)

```bash
node auto-rotate.js --telegram="VOTRE_TOKEN" --n8n="VOTRE_CLE"
```

**Exemple :**
```bash
node auto-rotate.js \
  --telegram="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz" \
  --n8n="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 🔐 Obtenir les Nouveaux Tokens

### Token Telegram
1. Ouvrez Telegram
2. Recherchez `@BotFather`
3. Commandes :
   ```
   /mybots
   [Votre bot]
   API Token > Revoke current token
   ```
4. Copiez le nouveau token

### API Key N8N
1. Ouvrez https://n8n.srv1289936.hstgr.cloud
2. Settings > API
3. **Supprimez l'ancienne clé**
4. Create API Key
5. Copiez la nouvelle clé

---

## ✅ Ce Qui Se Passe Automatiquement

1. **Validation** - Teste les deux credentials en parallèle
2. **Backup** - Sauvegarde l'ancien `.env` dans `.env.backup`
3. **Update** - Met à jour `.env` avec les nouveaux tokens
4. **Health-check** - Vérifie que tout fonctionne
5. **Cleanup** - Supprime `archive/` et fichiers temporaires
6. **Git Prepare** - Affiche la commande de commit prête

**Si une credential est invalide :** Le script s'arrête AVANT de toucher `.env`.

---

## 🚨 En Cas d'Erreur

### "Token Telegram invalide"
- Vérifiez que vous avez copié le token complet
- Format attendu : `1234567890:ABCdef...` (45+ caractères)
- Vérifiez qu'il n'y a pas d'espaces avant/après

### "N8N API Key invalide"
- Vérifiez que la clé est complète (200+ caractères)
- Vérifiez qu'elle a été créée dans N8N > Settings > API
- Essayez de créer une nouvelle clé

### Restaurer l'ancien .env
```bash
cp .env.backup .env
```

---

## 📋 Workflow Complet

```bash
# Étape 1 : Préparer les nouveaux tokens (via @BotFather et N8N)

# Étape 2 : Rotation automatique
echo "TELEGRAM_BOT_TOKEN=..." > new-creds.tmp
echo "N8N_API_KEY=..." >> new-creds.tmp
node auto-rotate.js --from-file=new-creds.tmp

# Étape 3 : Commit (commande affichée par le script)
git add .env.template .gitignore config.js health-check.js rotate-credentials.js cleanup-final.js auto-rotate.js ROTATION-GUIDE.md
git commit -m "chore: secure credentials with automated rotation system"
```

**TOTAL : 3 commandes, 2 minutes**

---

## 🎁 Bonus

### Exemple avec fichier template

```bash
# Copier le template
cp new-creds.tmp.example new-creds.tmp

# Éditer avec vos vraies valeurs
nano new-creds.tmp

# Lancer
node auto-rotate.js --from-file=new-creds.tmp
```

### Test sans rotation réelle

```bash
# Voir l'interface
node test-rotation-ui.js
```

---

## 📞 Aide

- **Guide complet** : [ROTATION-GUIDE.md](ROTATION-GUIDE.md)
- **Rapport d'audit** : Voir le rapport initial pour détails sécurité
- **Health-check** : `node health-check.js` à tout moment

---

**Prêt ?** Copiez vos nouveaux tokens et lancez :

```bash
echo "TELEGRAM_BOT_TOKEN=VOTRE_TOKEN" > new-creds.tmp
echo "N8N_API_KEY=VOTRE_CLE" >> new-creds.tmp
node auto-rotate.js --from-file=new-creds.tmp
```

🔔 Le terminal sonnera quand c'est terminé !
