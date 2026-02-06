# Guide Synchronisation GitHub

## Préparation pour Migration PC

Ce guide vous permet de sauvegarder l'ensemble de votre configuration IA Frankito sur GitHub pour une migration facile vers un nouveau PC.

### Ce Qui Est Sauvegardé

✅ **Inclus:**
- Configuration IA (AI_CONFIG.json)
- Structure des dossiers et projets
- Workflows N8N
- Documentation et notes
- Historique Git complet
- Configuration VS Code (.vscode/)
- Fichiers de configuration (.mcp.json, .gitignore)

❌ **NON inclus (sécurité):**
- Clés API et tokens (à configurer manuellement)
- Fichiers `.env` avec credentials
- Données sensibles

### Étape 1: Préparer le Repository

```powershell
# Naviguer au dossier Frankito-IA
cd C:\Users\Bonjour\Documents\Frankito-IA

# Vérifier l'état Git
git status

# Ajouter tous les fichiers de configuration
git add .
git status  # Vérifier ce qui sera commité
```

### Étape 2: Commit et Push

```powershell
# Créer un commit de sauvegarde
git commit -m "Configuration IA Frankito - Backup complet $(Get-Date -Format 'yyyy-MM-dd HH:mm')"

# Pousser vers GitHub
git push origin main
# ou
git push origin master
```

### Étape 3: Sur Un Nouveau PC

```powershell
# 1. Cloner le repository
git clone https://github.com/VOTRE_UTILISATEUR/Frankito-IA.git
cd Frankito-IA

# 2. Exécuter le script de restauration
.\setup_restoration.ps1

# 3. Configurer les variables sensibles
# Créer .env avec vos clés
```

### Vérification du Backup

**Avant de pusher sur GitHub, vérifier:**

```powershell
# Afficher les fichiers qui seront synchronisés
git diff --cached --name-only

# Vérifier pas de fichiers sensibles
git ls-files | Select-String -Pattern "\.env|secrets|passwords|token"
```

### Restauration Complète (Nouveau PC)

1. **Cloner** le repo GitHub
2. **Lancer** `setup_restoration.ps1`
3. **Ajouter** clés API dans `.env`
4. **Ouvrir** dans VS Code
5. **Vérifier** la configuration

### Fichiers Critiques à Synchroniser

| Fichier | Description | Synchronisé |
|---------|-------------|------------|
| AI_CONFIG.json | Configuration IA complète | ✅ |
| BACKUP_MANIFEST.md | Manifeste de sauvegarde | ✅ |
| setup_restoration.ps1 | Script restauration | ✅ |
| .mcp.json | Config Model Context Protocol | ✅ |
| n8n-skills/ | Workflows automatisation | ✅ |
| CLAUDE.md | Documentation Claude | ✅ |
| .gitignore | Fichiers à exclure | ✅ |

### Automatiser les Backups

Pour automatiser les backups réguliers:

```powershell
# Créer une tâche planifiée Windows
$TaskName = "Frankito-IA-Backup"
$Time = "03:00AM"  # 3h du matin

# Script à exécuter (sauvegarder comme backup-task.ps1)
```

### Dépannage

**Problème:** "fatal: not a git repository"
- Solution: `git init` puis ajouter le remote GitHub

**Problème:** Fichiers sensibles accidentellement commités
- Solution: `git rm --cached .env` puis `git commit`

**Problème:** Erreur authentification GitHub
- Solution: Générer Personal Access Token ou configurer SSH

### Checklist Avant Migration

- [ ] Tous les fichiers principaux ajoutés au Git
- [ ] Pas de credentials en clair
- [ ] Configuration IA (AI_CONFIG.json) à jour
- [ ] Script restauration testé
- [ ] Repository GitHub mis à jour
- [ ] README updated avec instructions
- [ ] Archivage local fait

### Contact & Support

Pour toute question sur la restauration:
1. Consulter BACKUP_MANIFEST.md
2. Vérifier setup_restoration.ps1
3. Lancer `git log` pour l'historique

