# Règles du Jeu - Automatisation N8N

## Vue d'ensemble du projet

Ce projet consiste à créer, corriger et améliorer des automatisations sur n8n avec l'assistance de Claude Code. L'objectif est de développer des workflows de haute qualité, optimisés et maintenables.

## Accès et permissions

### Accès fournis
- Dashboard n8n complet
- Tous les projets et workflows existants
- Accès administrateur complet
- Credentials et configurations

### Outils disponibles

1. **n8n MCP Server** (czlonkowski/n8n-mcp)
   - Connexion directe à l'instance n8n via Model Context Protocol
   - Accès à 1,084 nodes n8n (537 core + 547 community, 301 vérifiés)
   - 99% de couverture des propriétés avec schémas détaillés
   - 87% de couverture de la documentation officielle
   - 265 variants d'outils AI avec documentation complète
   - 2,646 configurations pré-extraites de templates populaires
   - 2,709 templates de workflows avec métadonnées complètes
   - Configuration : Voir [.mcp.json](.mcp.json) et [INSTALLATION.md](INSTALLATION.md)

2. **n8n Skills** (czlonkowski/n8n-skills)
   - Collection de 7 skills complémentaires pour Claude Code
   - Enseigne les best practices et patterns éprouvés
   - S'active automatiquement selon le contexte de la requête
   - Installation : `/plugin install czlonkowski/n8n-skills`
   - Repository local : [n8n-skills/](n8n-skills/)

## Principes de travail

### 1. Utilisation combinée des outils

**Règle d'or : TOUJOURS utiliser n8n MCP Server ET n8n Skills ensemble**

#### Synergie des outils
- **MCP Server** : Opérations techniques (CRUD, exécution, recherche de nodes)
- **Skills** : Best practices, patterns, syntaxe, validation
- **Combinaison** : Implémentation technique guidée par l'expertise

#### Les 7 Skills n8n (activation automatique)

1. **n8n-expression-syntax**
   - Syntaxe correcte des expressions n8n
   - Variables core : `$json`, `$node`, `$now`, `$env`
   - Erreurs courantes et corrections
   - **S'active sur** : Questions de syntaxe d'expressions

2. **n8n-mcp-tools** (PRIORITÉ HAUTE)
   - Guide d'utilisation efficace du MCP Server
   - Sélection des bons outils
   - Formats de paramètres corrects
   - **S'active sur** : Recherche de nodes, création de workflows

3. **n8n-workflow-patterns**
   - 5 patterns architecturaux éprouvés
   - Exemples réels de 2,653+ templates
   - Best practices d'architecture
   - **S'active sur** : Design de workflows, questions d'architecture

4. **n8n-validation**
   - Interprétation des erreurs de validation
   - Guide de troubleshooting
   - 4 profils de validation (Minimal, Runtime, AI-friendly, Strict)
   - **S'active sur** : Erreurs de validation, debugging

5. **n8n-node-config**
   - Configuration par opération
   - Règles de dépendances entre paramètres
   - Paramètres requis vs optionnels
   - **S'active sur** : Configuration de nodes spécifiques

6. **n8n-code-js**
   - 10 patterns JavaScript production-testés
   - Accès aux données (`$input`, `$json`, `items`, etc.)
   - Syntaxe et limitations des Code nodes
   - **S'active sur** : Code JavaScript dans n8n

7. **n8n-code-python**
   - Implémentation Python dans Code nodes
   - Limitations critiques (pas de librairies externes)
   - Quand utiliser Python vs JavaScript
   - **S'active sur** : Code Python dans n8n

#### Workflow de collaboration Skills + MCP

```
Requête utilisateur
    ↓
Skills activés (contexte automatique)
    ↓
Best practices + Patterns appliqués
    ↓
MCP Server (opérations techniques)
    ↓
Validation (Skills)
    ↓
Workflow de haute qualité
```

### 2. Standards de qualité
- Workflows robustes avec gestion d'erreurs complète
- Documentation claire et maintenue
- Code réutilisable et modulaire
- Tests et validation systématiques
- Performance optimisée

### 2.1. ⚠️ RÈGLES DE SÉCURITÉ CRITIQUES

**JAMAIS éditer directement les workflows de production avec l'IA !**

#### Checklist de sécurité obligatoire

✅ **AVANT toute modification :**
1. Faire une **copie** du workflow
2. Travailler sur la copie, jamais sur l'original
3. Tester en environnement de **développement/staging**
4. Exporter un **backup** avant modification
5. Valider les changements manuellement
6. Déployer en production seulement après validation complète

✅ **Protection des credentials :**
- Jamais de secrets en dur dans les workflows
- Toujours utiliser le credential management n8n
- Vérifier les permissions avant partage
- Rotation régulière des clés API

✅ **Validation des inputs :**
- Valider tous les inputs externes (webhooks, API)
- Sanitization des données
- Protection contre injections
- Limitation des tailles de données

### 2.2. 🔑 GOTCHAS CRITIQUES N8N

**À TOUJOURS se rappeler :**

1. **Données webhook** : Toujours sous `$json.body`
   ```javascript
   // ✅ CORRECT
   $json.body.email

   // ❌ INCORRECT
   $json.email
   ```

2. **Format nodeType** : Diffère selon le contexte
   - MCP Server : `nodes-base.httpRequest`
   - n8n interne : `n8n-nodes-base.httpRequest`

3. **Python Code nodes** : Limitations majeures
   - ❌ Pas de `requests`, `pandas`, `numpy`
   - ❌ Pas de librairies externes
   - ✅ Seulement standard library Python
   - 💡 **Recommandation** : Utiliser JavaScript pour 95% des cas

4. **JavaScript Code nodes** : Préféré
   - ✅ Accès complet aux items : `$input.all()`, `$input.first()`
   - ✅ Libraries disponibles : lodash, moment, etc.
   - ✅ Performance supérieure

5. **Configuration MCP** : Requis
   - ✅ `MCP_MODE: "stdio"` est **OBLIGATOIRE**
   - ❌ Sans ça : erreurs JSON parsing
   - ✅ `DISABLE_CONSOLE_OUTPUT: "true"` recommandé

### 3. Méthodologie de développement

#### Création de nouveaux workflows
1. Analyse des besoins et objectifs
2. Planification de l'architecture du workflow
3. Identification des nodes et intégrations nécessaires
4. Développement itératif avec tests
5. Documentation complète
6. Validation et déploiement

#### Correction de workflows existants
1. Analyse du problème et diagnostic
2. Identification de la cause racine
3. Proposition de solutions avec alternatives
4. Implémentation de la correction
5. Tests de régression
6. Documentation des changements

#### Amélioration de workflows
1. Audit du workflow existant
2. Identification des points d'amélioration (performance, maintenabilité, robustesse)
3. Proposition d'améliorations priorisées
4. Implémentation progressive
5. Mesure de l'impact
6. Documentation des optimisations

## Best practices N8N

### Architecture des workflows
- Workflows modulaires et réutilisables
- Séparation des responsabilités
- Utilisation de sub-workflows pour la logique complexe
- Gestion centralisée des credentials

### Gestion des erreurs
- Error workflows systématiques
- Logging approprié
- Retry logic intelligent
- Notifications en cas d'échec critique
- Fallback mechanisms

### Performance
- Limitation des boucles excessives
- Batch processing quand approprié
- Optimisation des requêtes API
- Caching intelligent
- Monitoring des temps d'exécution

### Sécurité
- Gestion sécurisée des credentials
- Validation des inputs
- Sanitization des données
- Respect des principes de moindre privilège
- Audit trail des opérations sensibles

### Maintenabilité
- Naming conventions claires et consistantes
- Documentation inline dans les nodes
- README pour chaque workflow complexe
- Versioning et changelog
- Tests de validation

## Workflow type par cas d'usage

### Intégrations API
- Authentification robuste (OAuth, API keys, JWT)
- Rate limiting et throttling
- Pagination gérée automatiquement
- Transformation de données
- Error handling spécifique aux APIs

### Automatisations de données
- ETL (Extract, Transform, Load)
- Data validation et cleaning
- Déduplication
- Enrichissement de données
- Synchronisation multi-sources

### Notifications et alerting
- Multi-channel (email, Slack, SMS, etc.)
- Templating dynamique
- Prioritization des alertes
- Deduplication des notifications
- Escalation automatique

### Scheduled jobs
- Cron expressions optimisées
- Idempotence garantie
- State management
- Monitoring d'exécution
- Recovery mechanisms

## Processus de collaboration

### Communication
- Questions de clarification avant développement
- Propositions d'alternatives avec pros/cons
- Demande de validation pour changements majeurs
- Updates réguliers sur l'avancement

### Documentation
- Documentation technique dans les workflows
- Documentation utilisateur séparée
- Diagrammes d'architecture si nécessaire
- Troubleshooting guides

### Validation
- Tests unitaires des composants critiques
- Tests d'intégration end-to-end
- Validation des performances
- Review de sécurité

## Metrics de succès

### Qualité
- Workflows sans erreurs en production
- Temps de réponse optimaux
- Taux de succès > 99%

### Maintenabilité
- Documentation à jour
- Code compréhensible par d'autres
- Facilité de debugging

### Impact business
- Automatisation effective des processus
- ROI positif (temps économisé vs temps de développement)
- Satisfaction utilisateur

## Outils et ressources

### N8N MCP Server (czlonkowski/n8n-mcp)

#### Capacités de documentation
- **1,084 nodes n8n** disponibles :
  - 537 nodes core
  - 547 nodes community
  - 301 nodes vérifiés
- **99% de couverture** des propriétés avec schémas détaillés
- **87% de couverture** de la documentation officielle n8n
- **265 variants d'outils** AI avec documentation complète

#### Base de connaissances
- **2,646 configurations** pré-extraites de templates populaires
- **2,709 templates de workflows** avec métadonnées complètes
- Patterns éprouvés pour cas d'usage communs
- Exemples réels de la communauté n8n

#### Opérations disponibles (avec API n8n configurée)
- **Workflows** : CRUD complet (Create, Read, Update, Delete)
- **Exécution** : Test et exécution de workflows
- **Activation** : Activation/désactivation de workflows
- **Export/Import** : Sauvegarde et restauration
- **Monitoring** : Historique d'exécution et logs
- **Credentials** : Gestion des accès (lecture seule pour sécurité)

#### Configuration
- Fichier : [.mcp.json](.mcp.json)
- Variables requises :
  - `N8N_API_URL` : URL de votre instance
  - `N8N_API_KEY` : Clé API avec permissions appropriées
  - `MCP_MODE: "stdio"` : **OBLIGATOIRE**
- Guide complet : [INSTALLATION.md](INSTALLATION.md)

#### Options d'hébergement
1. **npx** (recommandé) : `npx n8n-mcp` - Zéro installation
2. **Docker** : `docker pull ghcr.io/czlonkowski/n8n-mcp:latest`
3. **Hosted Service** : dashboard.n8n-mcp.com (100 calls/jour gratuit)
4. **Local** : Clone + build pour développement
5. **Railway** : One-click cloud deployment

### N8N Skills (czlonkowski/n8n-skills)

#### Les 7 Skills détaillés

| Skill | Priorité | Quand l'utiliser | Capacités clés |
|-------|----------|------------------|----------------|
| **n8n-mcp-tools** | 🔴 HAUTE | Toute interaction MCP | Sélection d'outils, formats de paramètres, recherche efficace |
| **n8n-expression-syntax** | 🟠 Moyenne | Expressions n8n | Syntaxe, variables core, erreurs courantes |
| **n8n-workflow-patterns** | 🟠 Moyenne | Design de workflows | 5 patterns éprouvés, architecture, best practices |
| **n8n-validation** | 🟡 Contextuelle | Erreurs de validation | 4 profils, troubleshooting, interprétation d'erreurs |
| **n8n-node-config** | 🟡 Contextuelle | Configuration de nodes | Paramètres par opération, dépendances |
| **n8n-code-js** | 🟢 Au besoin | Code JavaScript | 10 patterns, accès données, syntaxe |
| **n8n-code-python** | 🟢 Au besoin | Code Python | Limitations, alternatives, cas d'usage |

#### Activation automatique
Les skills s'activent automatiquement selon le contexte de votre requête :
- Vous demandez une expression → **n8n-expression-syntax** s'active
- Vous cherchez un node → **n8n-mcp-tools** + **n8n-node-config** s'activent
- Vous designez un workflow → **n8n-workflow-patterns** s'active
- Vous avez une erreur → **n8n-validation** s'active
- Vous codez en JS → **n8n-code-js** s'active

#### Installation
```bash
# Option 1 : Plugin (recommandé)
/plugin install czlonkowski/n8n-skills

# Option 2 : Manuel (déjà cloné dans n8n-skills/)
# Voir INSTALLATION.md pour les étapes
```

#### Ressources
- Repository local : [n8n-skills/](n8n-skills/)
- Documentation : Incluse dans chaque skill
- Support : 525+ nodes, 2,653+ templates référencés

### Profils de validation

Choisissez selon votre besoin :

| Profil | Usage | Avantages | Inconvénients |
|--------|-------|-----------|---------------|
| **Minimal** | Développement rapide | Rapide, peu de checks | Peut manquer des erreurs |
| **Runtime** | Testing | Erreurs à l'exécution | Pas de validation préalable |
| **AI-friendly** | Recommandé avec Claude | Équilibré, clair | - |
| **Strict** | Production | Validation complète | Peut être verbeux |

**Recommandation** : Utiliser **AI-friendly** pour le développement avec Claude, puis **Strict** avant production.

### Documentation de référence
- **n8n MCP Server** : https://github.com/czlonkowski/n8n-mcp
- **n8n Skills** : https://github.com/czlonkowski/n8n-skills
- **Documentation MCP** : https://www.n8n-mcp.com
- **Documentation n8n officielle** : https://docs.n8n.io
- **Community nodes** : https://n8n.io/integrations
- **Forum n8n** : https://community.n8n.io
- **Templates n8n** : https://n8n.io/workflows

## Guide d'utilisation MCP Server + Skills

### Workflow de développement optimal

#### 1. Recherche et découverte
```
Vous : "Quels nodes n8n sont disponibles pour Slack ?"

→ Skill n8n-mcp-tools s'active
→ MCP Server : Recherche dans les 1,084 nodes
→ Résultat : Liste des nodes Slack avec descriptions
```

#### 2. Conception du workflow
```
Vous : "Comment créer un workflow qui envoie les webhooks à Slack ?"

→ Skill n8n-workflow-patterns s'active (pattern Webhook→API)
→ Skill n8n-mcp-tools guide la recherche de nodes
→ MCP Server : Recherche nodes Webhook + Slack
→ Résultat : Architecture recommandée avec nodes spécifiques
```

#### 3. Configuration des nodes
```
Vous : "Comment configurer le node Slack pour envoyer un message ?"

→ Skill n8n-node-config s'active
→ MCP Server : Récupère le schéma du node Slack
→ Résultat : Configuration complète avec paramètres requis
```

#### 4. Expressions et données
```
Vous : "Comment accéder aux données du webhook dans Slack ?"

→ Skill n8n-expression-syntax s'active
→ Résultat : Syntaxe correcte `$json.body.message`
→ Explication des variables disponibles
```

#### 5. Code personnalisé
```
Vous : "J'ai besoin de transformer les données avec du JavaScript"

→ Skill n8n-code-js s'active
→ Résultat : Pattern JavaScript adapté
→ Accès aux données : $input.all(), $input.first()
→ Best practices pour performance
```

#### 6. Validation et débogage
```
Vous : "J'ai une erreur 'Required parameter missing'"

→ Skill n8n-validation s'active
→ Analyse de l'erreur
→ MCP Server : Vérifie la configuration du node
→ Résultat : Paramètre manquant identifié + solution
```

#### 7. Création/Modification du workflow
```
→ MCP Server : Création du workflow via API n8n
→ Tous les skills : Validation de la configuration
→ MCP Server : Sauvegarde et activation
→ Résultat : Workflow de production prêt
```

### Exemples de requêtes efficaces

#### Exemple 1 : Nouveau workflow complet
```
"Crée un workflow qui :
1. Reçoit un webhook avec données utilisateur
2. Valide le format email
3. Enrichit avec données CRM (HTTP request)
4. Envoie notification Slack
5. Enregistre dans Google Sheets"

→ Skills activés : patterns, mcp-tools, node-config, expression-syntax
→ MCP Server : Recherche tous les nodes nécessaires
→ Résultat : Workflow complet avec gestion d'erreurs
```

#### Exemple 2 : Debug d'un workflow existant
```
"Mon workflow webhook→Slack échoue avec l'erreur 'invalid_auth'"

→ Skill validation active
→ MCP Server : Analyse du workflow
→ Diagnostic : Credential Slack non configuré ou expiré
→ Solution : Étapes pour reconfigurer le credential
```

#### Exemple 3 : Optimisation de performance
```
"Mon workflow traite 1000 items et c'est trop lent"

→ Skill workflow-patterns active
→ Analyse : Identifier les bottlenecks
→ Solution : Batch processing, parallélisation, caching
→ MCP Server : Modification du workflow avec optimisations
```

### Best practices pour requêtes

#### ✅ Requêtes efficaces
- Être spécifique sur le besoin
- Mentionner les contraintes (performance, sécurité)
- Inclure les messages d'erreur complets
- Préciser l'environnement (production, dev, staging)

#### ❌ Requêtes à éviter
- Trop vagues : "Fais-moi un workflow"
- Sans contexte : "Ça marche pas, aide-moi"
- Sans détails d'erreur
- Sans mention de l'environnement

### Checklist qualité avant production

Avant de déployer un workflow en production, vérifier :

- [ ] **Sécurité**
  - [ ] Copie du workflow original sauvegardée
  - [ ] Credentials correctement configurés
  - [ ] Validation des inputs externes
  - [ ] Pas de secrets en dur

- [ ] **Fonctionnalité**
  - [ ] Workflow testé en staging
  - [ ] Tous les cas d'erreur gérés
  - [ ] Notifications d'erreur configurées
  - [ ] Logging approprié en place

- [ ] **Performance**
  - [ ] Temps d'exécution acceptable
  - [ ] Pas de boucles infinies possibles
  - [ ] Rate limiting respecté
  - [ ] Ressources optimisées

- [ ] **Maintenabilité**
  - [ ] Documentation inline complète
  - [ ] Naming conventions respectées
  - [ ] Workflow modulaire si complexe
  - [ ] README créé si nécessaire

- [ ] **Validation**
  - [ ] Tests end-to-end passés
  - [ ] Validation avec profil AI-friendly ou Strict
  - [ ] Review manuelle effectuée
  - [ ] Monitoring post-déploiement prévu

## Évolution et amélioration continue

### Apprentissage
- Veille sur nouvelles features n8n
- Exploration de nouveaux nodes et intégrations
- Optimisation des patterns existants

### Feedback loop
- Collecte de feedback sur les workflows
- Mesure de performance
- Identification des pain points
- Itération et amélioration

### Innovation
- Exploration de cas d'usage avancés
- Création de patterns réutilisables
- Automatisation de l'automatisation
- Partage de connaissances

## Installation et configuration

### Fichiers de configuration du projet

| Fichier | Description | Action requise |
|---------|-------------|----------------|
| [.mcp.json](.mcp.json) | Configuration MCP Server | ⚠️ Configurer N8N_API_URL et N8N_API_KEY |
| [INSTALLATION.md](INSTALLATION.md) | Guide d'installation complet | 📖 Suivre les étapes |
| [n8n-skills/](n8n-skills/) | Repository des skills cloné | ✅ Prêt à utiliser |
| [CLAUDE.md](CLAUDE.md) | Documentation principale | 📖 Référence |

### Étapes d'installation rapide

1. **Configurer le MCP Server**
   ```bash
   # Éditer .mcp.json avec vos credentials n8n
   # Voir INSTALLATION.md pour détails
   ```

2. **Installer les Skills**
   ```bash
   /plugin install czlonkowski/n8n-skills
   ```

3. **Redémarrer Claude Code**
   ```bash
   # Fermer et rouvrir Claude Code
   ```

4. **Tester l'installation**
   ```bash
   # Demander : "Quels nodes n8n sont disponibles pour Slack ?"
   # Le MCP Server et les skills devraient répondre
   ```

### Support et dépannage

- **Guide complet** : [INSTALLATION.md](INSTALLATION.md)
- **Issues MCP Server** : https://github.com/czlonkowski/n8n-mcp/issues
- **Issues Skills** : https://github.com/czlonkowski/n8n-skills/issues
- **Documentation n8n** : https://docs.n8n.io
- **Community n8n** : https://community.n8n.io

---

**Document maintenu par** : Claude Code
**Dernière mise à jour** : 2026-02-03
**Version** : 2.0 - Enrichi avec détails MCP Server & Skills

**Note importante** : Ce document est vivant et doit être mis à jour au fur et à mesure de l'évolution du projet et de l'acquisition de nouvelles connaissances.
