# 📁 Structure du Projet - Frankito-IA

Documentation complète de l'architecture et de l'organisation du projet.

---

## 🏗️ Architecture Globale

```
Frankito-IA/
│
├── 🤖 bots/                    # Scripts de bots (documentation + liens)
├── 📊 n8n-workflows/           # Exports JSON des workflows N8N
├── 🔌 mcp-resources/           # Ressources MCP (Model Context Protocol)
├── 🛠️  scripts/                 # Scripts utilitaires
│   ├── rotation/              # Scripts de rotation credentials
│   ├── health/                # Scripts de diagnostic
│   ├── deployment/            # Scripts de déploiement
│   └── tests/                 # Scripts de test
│
├── 📚 docs/                    # Documentation
│   ├── guides/                # Guides utilisateur
│   ├── architecture/          # Documentation architecture
│   └── audit/                 # Rapports d'audit
│
├── 💻 src/                     # Code source
│   ├── bot/                   # Logique bot (futur)
│   └── utils/                 # Utilitaires réutilisables
│
├── 📦 workflows/               # Workflows organisés
│   ├── production/            # Workflows en production
│   └── templates/             # Templates réutilisables
│
├── 📋 executions/              # Logs d'exécution N8N
├── 🗂️  n8n-skills/             # Bot Telegram actif + dependencies
│
└── ⚙️  [Fichiers de configuration racine]
```

---

## 📂 Détail des Dossiers

### 🤖 `/bots/`
**Purpose:** Point d'entrée documenté pour tous les bots

**Contenu:**
- README avec liens vers bots actifs
- Scripts wrapper (futurs)
- Configurations bot-specific

**Bot Principal:** Actuellement dans `n8n-skills/bot.js`

---

### 📊 `/n8n-workflows/`
**Purpose:** Stockage et versioning des workflows N8N

**Contenu:**
- Fichiers JSON exports de N8N
- Documentation des workflows
- Guides de déploiement

**Workflows Actifs:**
- `moltbot_core.json` - Bot principal
- `deploy-bot-*.json` - Workflows de déploiement
- Autres workflows d'automatisation

---

### 🔌 `/mcp-resources/`
**Purpose:** Ressources pour serveurs MCP

**Contenu (futur):**
- `configs/` - Configurations MCP
- `tools/` - Outils MCP personnalisés
- `prompts/` - Prompts réutilisables
- `schemas/` - Schémas de validation

**Configuration Actuelle:** `.mcp.json` à la racine

---

### 🛠️ `/scripts/`
**Purpose:** Scripts utilitaires organisés par catégorie

**Structure:**
```
scripts/
├── rotation/
│   ├── auto-rotate.js          # Rotation automatique credentials
│   ├── rotate-credentials.js   # Rotation interactive
│   └── cleanup-final.js        # Nettoyage post-rotation
│
├── health/
│   └── health-check.js         # Diagnostic système complet
│
├── deployment/
│   ├── deploy_bot.sh           # Déploiement Linux/Mac
│   └── deploy_bot.ps1          # Déploiement Windows
│
└── tests/
    ├── test-rotation-ui.js     # Test UI rotation
    ├── beep.js                 # Test notifications
    └── ding.js                 # Simple beep
```

---

### 📚 `/docs/`
**Purpose:** Documentation complète du projet

**Structure:**
```
docs/
├── guides/
│   ├── ROTATION-GUIDE.md       # Guide rotation credentials
│   ├── QUICK-START.md          # Démarrage rapide
│   └── PORTABILITY-GUIDE.md    # Guide portabilité multi-OS
│
├── architecture/
│   ├── CLAUDE.md               # Instructions Claude Code
│   └── règles du jeu*.md       # Principes N8N
│
└── audit/
    ├── AUDIT-REPORT.md         # Rapport d'audit complet
    └── [Futurs rapports]
```

---

### 💻 `/src/`
**Purpose:** Code source organisé (future expansion)

**Structure:**
```
src/
├── bot/                        # Logique bot (à venir)
│   ├── handlers/              # Handlers de commandes
│   └── middleware/            # Middleware Telegraf
│
└── utils/                     # Utilitaires réutilisables
    ├── validators/            # Validateurs
    └── helpers/               # Fonctions helper
```

---

### 📦 `/workflows/`
**Purpose:** Workflows organisés par statut

**Structure:**
```
workflows/
├── production/                 # Workflows déployés en prod
└── templates/                  # Templates réutilisables
```

---

### 🗂️ `/n8n-skills/`
**Purpose:** Bot Telegram opérationnel + dependencies

**Contenu:**
- `bot.js` - Bot Telegram principal
- `telegram-bot.js` - Bot legacy
- `package.json` - Dependencies
- `node_modules/` - Packages installés
- `workflows/` - Workflows liés au bot

**Note:** Ce dossier reste en place pour maintenir les dependencies et chemins fonctionnels.

---

## ⚙️ Fichiers de Configuration Racine

### Configuration Principale
- **`config.js`** - Configuration centralisée
- **`.env`** - Variables d'environnement (gitignored)
- **`.env.template`** - Template pour .env

### Git & Standards
- **`.gitignore`** - Fichiers exclus de Git
- **`.gitattributes`** - Normalisation line endings
- **`.editorconfig`** - Standards d'édition
- **`.nvmrc`** - Version Node.js (20)

### MCP & Tools
- **`.mcp.json`** - Configuration serveurs MCP
- **`.claude/`** - Settings Claude Code

### Documentation
- **`README.md`** - Vue d'ensemble projet
- **`STRUCTURE.md`** - Ce fichier
- **`COMMANDS.md`** - Référence rapide commandes

### Outils
- **`auto-fix.js`** - Corrections automatiques
- **`portability-check.js`** - Validation portabilité
- **`health-check.js`** - Copie root (alias vers scripts/health/)
- **`auto-rotate.js`** - Copie root (alias vers scripts/rotation/)
- **`rotate-credentials.js`** - Copie root (alias vers scripts/rotation/)
- **`cleanup-final.js`** - Copie root (alias vers scripts/rotation/)

---

## 🔄 Flux de Travail

### 1. Développement
```
src/ → tests → scripts/tests/ → validation
```

### 2. Workflows N8N
```
N8N UI → export JSON → n8n-workflows/ → Git
```

### 3. Déploiement Bot
```
scripts/deployment/ → test → production
```

### 4. Rotation Credentials
```
scripts/rotation/auto-rotate.js → validation → commit
```

---

## 📋 Conventions

### Naming
- **Dossiers:** lowercase-with-dashes
- **Fichiers JS:** kebab-case.js
- **Fichiers MD:** UPPERCASE-WITH-DASHES.md
- **Config files:** .lowercase

### Git
- **Commits:** Conventional Commits (feat:, fix:, chore:, docs:)
- **Branches:** feature/, fix/, chore/
- **Tags:** v1.0.0 (semver)

### Code
- **Indentation:** 2 spaces
- **Line endings:** LF (Unix)
- **Charset:** UTF-8
- **Node version:** 20 (voir .nvmrc)

---

## 🔒 Sécurité

### Fichiers Sensibles (gitignored)
- `.env` et variations
- `*.key`, `*.pem`
- `credentials/`, `secrets/`
- `node_modules/`
- `backup-*/`
- `execution_*.json`

### Best Practices
1. Ne jamais commiter de credentials
2. Utiliser config.js pour centraliser
3. Rotation régulière des clés API
4. Health-check avant chaque commit important

---

## 🚀 Quick Reference

### Démarrer le Bot
```bash
node n8n-skills/bot.js
```

### Health Check
```bash
node health-check.js
```

### Rotation Credentials
```bash
node auto-rotate.js --from-file=new-creds.tmp
```

### Portability Check
```bash
node portability-check.js --verbose
```

### Auto-Fix Issues
```bash
node auto-fix.js --critical-only
```

---

## 📊 Métriques Projet

- **Total fichiers:** ~150
- **Lignes de code:** ~25,000
- **Scripts:** 30+
- **Workflows N8N:** 15+
- **Documentation:** 12 fichiers MD
- **Portabilité:** 76%
- **Tests:** Health-check, Portability-check

---

## 🔗 Liens Utiles

### Documentation
- [README.md](README.md) - Vue d'ensemble
- [COMMANDS.md](COMMANDS.md) - Référence commandes
- [AUDIT-REPORT.md](docs/audit/AUDIT-REPORT.md) - Audit complet
- [PORTABILITY-GUIDE.md](docs/guides/PORTABILITY-GUIDE.md) - Guide portabilité

### Workflows
- [N8N Instance](https://n8n.srv1289936.hstgr.cloud)
- [Workflow Master](https://n8n.srv1289936.hstgr.cloud/workflow/dMksAyCROpecNL7A)

---

**Version:** 1.0.0
**Dernière mise à jour:** 2026-02-07
**Maintenu par:** Claude Code
