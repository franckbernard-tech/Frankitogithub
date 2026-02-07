# Projet N8N Automation - Documentation Claude

## Vue d'ensemble

Ce projet est dédié à la création, la correction et l'amélioration d'automatisations sur n8n avec l'assistance de Claude Code. L'objectif principal est de développer des workflows robustes, performants et maintenables qui automatisent efficacement les processus métier.

## Contexte du projet

### Objectifs
- Créer des workflows n8n de haute qualité
- Corriger et debugger les workflows existants
- Améliorer les performances et la robustesse
- Maintenir une documentation complète
- Établir des standards et best practices

### Portée
- Tous les workflows n8n de l'organisation
- Intégrations avec services tiers
- Automatisations de processus métier
- ETL et pipelines de données
- Notifications et alerting

## Architecture

### Structure du projet

```
claude-code/
├── règles du jeu- automatisation N8N.md    # Document de base avec principes et règles
├── CLAUDE.md                                # Ce fichier - documentation principale
├── workflows/                               # Workflows n8n (à créer)
│   ├── production/                         # Workflows en production
│   ├── staging/                            # Workflows en test
│   └── templates/                          # Templates réutilisables
├── docs/                                   # Documentation détaillée (à créer)
│   ├── architecture/                       # Diagrammes et architecture
│   ├── guides/                             # Guides utilisateur
│   └── troubleshooting/                    # Résolution de problèmes
└── scripts/                                # Scripts utilitaires (à créer)
    ├── deployment/                         # Scripts de déploiement
    └── monitoring/                         # Scripts de monitoring
```

### Composants principaux

#### 1. N8N Instance
- Dashboard accessible avec droits administrateur
- Workflows actifs et inactifs
- Credentials management
- Execution history
- Webhook endpoints

#### 2. Outils Claude

##### N8N MCP Server
**Fonctionnalités :**
- Connexion directe à l'instance n8n
- Gestion CRUD des workflows
- Exécution et monitoring des workflows
- Gestion des credentials
- Export/Import de workflows

**Cas d'usage :**
- Opérations techniques sur les workflows
- Déploiement automatisé
- Monitoring et debugging
- Backup et restore

##### N8N Skills
**Fonctionnalités :**
- Patterns et templates éprouvés
- Best practices codifiées
- Solutions aux problèmes courants
- Optimisations avancées

**Cas d'usage :**
- Référence pour l'implémentation
- Résolution de problèmes complexes
- Optimisation de workflows
- Apprentissage et formation

#### 3. Synergie des outils
La combinaison du MCP Server et des Skills permet :
- Implémentation technique (MCP) guidée par les best practices (Skills)
- Validation automatique de la qualité
- Détection et correction proactive des problèmes
- Optimisation continue

## Méthodologie de travail

### Phase 1 : Analyse
1. Comprendre le besoin ou le problème
2. Analyser le contexte et les contraintes
3. Identifier les intégrations nécessaires
4. Évaluer la complexité et les risques

### Phase 2 : Planification
1. Utiliser TodoWrite pour créer un plan d'action
2. Définir l'architecture du workflow
3. Identifier les nodes et connections
4. Planifier la gestion d'erreurs
5. Prévoir les tests et validations

### Phase 3 : Développement
1. Utiliser n8n MCP Server pour créer/modifier les workflows
2. Appliquer les best practices via n8n Skills
3. Implémenter la gestion d'erreurs
4. Ajouter le logging approprié
5. Documenter inline dans les nodes

### Phase 4 : Test et validation
1. Tests unitaires des composants critiques
2. Tests d'intégration end-to-end
3. Tests de performance
4. Validation de la gestion d'erreurs
5. Review de sécurité

### Phase 5 : Documentation et déploiement
1. Documentation technique complète
2. Guide utilisateur si nécessaire
3. Déploiement en staging puis production
4. Monitoring post-déploiement
5. Collecte de feedback

## Standards de développement

### Naming conventions

#### Workflows
- Format : `[Catégorie] - [Fonction] - [Version]`
- Exemple : `API - Sync Customers - v2.1`
- Catégories : API, ETL, Notification, Scheduled, Integration, Utility

#### Nodes
- Noms descriptifs et clairs
- Éviter les noms génériques (Node1, Node2)
- Format : `[Action] [Resource]`
- Exemple : `Fetch Users`, `Transform Data`, `Send Email`

#### Variables
- camelCase pour les variables JavaScript
- snake_case pour les variables d'environnement
- Noms explicites et auto-documentés

### Structure des workflows

```
Trigger
  ↓
Input Validation
  ↓
Main Logic
  ├─→ Success Path
  │    ↓
  │   Output Formatting
  │    ↓
  │   Success Actions
  │
  └─→ Error Path
       ↓
      Error Handling
       ↓
      Error Notifications
```

### Gestion d'erreurs

#### Niveaux d'erreurs
1. **Critical** : Workflow ne peut pas continuer, nécessite intervention
2. **Error** : Échec de l'opération, retry possible
3. **Warning** : Problème non bloquant, nécessite attention
4. **Info** : Information pour debugging

#### Actions par niveau
- Critical : Stop + notification immédiate + escalation
- Error : Retry logic + notification si échec persistant
- Warning : Log + notification groupée
- Info : Log seulement

### Documentation

#### Documentation inline
Chaque node critique doit avoir :
- Description de son rôle
- Inputs attendus
- Outputs produits
- Cas d'erreur possibles

#### Documentation workflow
Chaque workflow complexe doit avoir :
- README avec vue d'ensemble
- Diagramme de flux
- Configuration requise
- Credentials nécessaires
- Dépendances externes
- Guide de troubleshooting

## Patterns de workflows

### 1. API Integration Pattern

```
Webhook/Trigger
  ↓
Validate Input
  ↓
Rate Limit Check
  ↓
API Authentication
  ↓
API Request (with retry)
  ↓
Response Validation
  ↓
Transform Data
  ↓
Store/Forward Data
  ↓
Success Response
```

**Best practices :**
- Authentification centralisée via credentials
- Rate limiting avec backoff exponentiel
- Retry logic avec délais croissants
- Validation complète des responses
- Timeout appropriés

### 2. ETL Pattern

```
Extract (Source)
  ↓
Validate Source Data
  ↓
Transform
  ├─→ Clean Data
  ├─→ Enrich Data
  ├─→ Deduplicate
  └─→ Format Data
  ↓
Validate Transformed Data
  ↓
Load (Destination)
  ↓
Verify Load
  ↓
Update Metadata
```

**Best practices :**
- Batch processing pour volumes importants
- Checkpointing pour recovery
- Validation à chaque étape
- Logging détaillé
- Monitoring des volumes

### 3. Notification Pattern

```
Trigger Event
  ↓
Check Notification Rules
  ↓
Deduplicate
  ↓
Format Message
  ├─→ Email Template
  ├─→ Slack Template
  └─→ SMS Template
  ↓
Send Notification
  ↓
Log Delivery Status
  ↓
Handle Failures
```

**Best practices :**
- Templating pour réutilisabilité
- Multi-channel avec fallback
- Deduplication sur fenêtre temporelle
- Tracking des deliveries
- Respect des préférences utilisateur

### 4. Scheduled Job Pattern

```
Cron Trigger
  ↓
Check Last Execution
  ↓
Acquire Lock
  ↓
Execute Job Logic
  ↓
Update State
  ↓
Release Lock
  ↓
Report Status
```

**Best practices :**
- Idempotence garantie
- Locking pour éviter double exécution
- State management persistant
- Monitoring d'exécution
- Alerting sur échecs

## Sécurité

### Gestion des credentials
- Utiliser le credential management n8n
- Jamais de secrets en dur dans les workflows
- Rotation régulière des credentials
- Principe de moindre privilège
- Audit des accès

### Validation des inputs
- Validation de tous les inputs externes
- Sanitization des données
- Protection contre injection
- Limitation des tailles de données
- Type checking strict

### Audit et logging
- Log de toutes les opérations sensibles
- Pas de données sensibles dans les logs
- Retention appropriée des logs
- Monitoring des anomalies
- Compliance avec réglementations

## Performance

### Optimisations
- Éviter les boucles excessives
- Batch processing quand possible
- Caching des données statiques
- Parallélisation quand approprié
- Limitation des appels API

### Monitoring
- Temps d'exécution des workflows
- Taux de succès/échec
- Volume de données traitées
- Utilisation ressources
- SLA tracking

### Scaling
- Identification des bottlenecks
- Optimisation des requêtes
- Distribution de charge
- Queue management
- Resource allocation

## Troubleshooting

### Problèmes courants

#### Workflow ne démarre pas
- Vérifier le trigger configuration
- Vérifier les credentials
- Vérifier les permissions
- Checker les logs d'erreur
- Vérifier les dépendances

#### Workflow échoue en cours
- Analyser les execution logs
- Vérifier les inputs des nodes échouant
- Tester les credentials
- Vérifier la connectivité externe
- Checker les rate limits

#### Performance dégradée
- Analyser les execution times
- Identifier les nodes lents
- Vérifier les volumes de données
- Checker les ressources système
- Optimiser les requêtes

### Debugging

#### Outils
- Execution history dans n8n
- Node output inspection
- Error workflow logs
- External service logs
- N8N MCP Server pour analyse

#### Méthodologie
1. Reproduire le problème
2. Isoler le node problématique
3. Analyser les inputs/outputs
4. Vérifier la configuration
5. Tester la correction
6. Valider en conditions réelles

## Workflow de collaboration avec Claude

### Communication
- Poser des questions de clarification
- Proposer des alternatives avec pros/cons
- Demander validation pour changements majeurs
- Fournir des updates réguliers
- Partager les apprentissages

### Modèles
- Utiliser Claude Sonnet 4.5 (modèle principal)
- Utiliser Haiku pour tâches simples et rapides
- Ne pas utiliser Opus (selon instruction)

### Outils
- TodoWrite pour tracking des tâches
- N8N MCP Server pour opérations techniques
- N8N Skills pour best practices
- Combinaison systématique des deux outils n8n

## Évolution du projet

### Court terme
- Mise en place de la structure de projet
- Documentation des workflows existants
- Standardisation des patterns
- Amélioration des workflows critiques

### Moyen terme
- Bibliothèque de templates
- Automatisation du testing
- Dashboard de monitoring
- Formation des utilisateurs

### Long terme
- AI-assisted workflow optimization
- Predictive monitoring
- Self-healing workflows
- Advanced analytics

## Ressources

### Documentation
- Documentation officielle n8n : https://docs.n8n.io
- Community nodes : https://n8n.io/integrations
- n8n Forum : https://community.n8n.io

### Outils
- N8N MCP Server : Outil d'intégration Claude-n8n
- N8N Skills : Bibliothèque de compétences n8n
- Claude Code : Assistant IA pour développement

### Support
- Dashboard n8n : Accès direct à l'instance
- Execution logs : Historique et debugging
- Error workflows : Gestion centralisée des erreurs

---

**Document maintenu par :** Claude Code
**Dernière mise à jour :** 2026-02-03
**Version :** 1.0

**Note :** Ce document est vivant et doit être mis à jour régulièrement pour refléter l'évolution du projet, les nouveaux learnings et les best practices émergentes.
