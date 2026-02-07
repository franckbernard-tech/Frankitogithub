# Manifeste de Sauvegarde IA

## Informations de Sauvegarde
- **Date**: 2026-02-06
- **Utilisateur**: Bonjour
- **Chemin Projet**: C:\Users\Bonjour\Documents\Frankito-IA
- **Plateforme d'IA**: Claude Haiku 4.5

## Structure à Restaurer

### Dossiers Essentiels
- `n8n-skills/` - Compétences N8N
- `.claude/` - Données de configuration Claude
- `.git/` - Historique Git

### Fichiers Configuration
- `AI_CONFIG.json` - Configuration IA centralisée
- `CLAUDE.md` - Documentation Claude
- `.mcp.json` - Configuration Model Context Protocol
- `.gitignore` - Règles d'exclusion Git

### Fichiers Documentation
- `README.md` - Guide principal
- `INSTALLATION.md` - Instructions d'installation
- `règles du jeu- automatisation N8N.md` - Règles N8N
- `BACKUP_MANIFEST.md` - Ce fichier

## Instructions de Restauration

### Sur un Nouveau PC:

1. **Cloner le repository**
   ```powershell
   git clone <URL-GITHUB> Frankito-IA
   cd Frankito-IA
   ```

2. **Vérifier les fichiers de configuration**
   - Confirmer la présence de `AI_CONFIG.json`
   - Vérifier `.mcp.json`

3. **Restaurer l'environnement**
   ```powershell
   .\setup_restoration.ps1
   ```

4. **Valider la configuration**
   - Ouvrir le projet dans VS Code
   - Vérifier les extensions installées
   - Tester la connexion avec l'IA

## Contenu Sauvegardé

### Données IA
- ✅ Configuration Claude intégrée
- ✅ Historique de projets
- ✅ Paramètres de workspace
- ✅ Chemins et références

### Données N8N
- ✅ Workflows et automations
- ✅ Configuration des skills
- ✅ Paramètres d'intégration

## Important: Sécurité

Les fichiers sensibles (clés API, tokens) ne sont PAS inclus dans cette sauvegarde pour des raisons de sécurité.

**À faire après restauration:**
1. Ajouter vos clés API à `.env` (non versionnées)
2. Configurer les tokens personnels
3. Mettre à jour les URLs de connexion si nécessaire

## Vérification Post-Restauration

- [ ] Tous les dossiers présents
- [ ] Git history intacte
- [ ] Configuration IA chargée
- [ ] VS Code extensions synchronisées
- [ ] N8N workflows visibles
- [ ] Pas d'erreurs de chemins

