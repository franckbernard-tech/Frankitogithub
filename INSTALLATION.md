# Guide d'Installation - n8n MCP Server & n8n Skills

Ce guide vous accompagne dans l'installation et la configuration des deux outils essentiels pour travailler avec n8n dans Claude Code.

## Prérequis

- Node.js installé sur votre système
- Une instance n8n accessible (locale ou cloud)
- Clé API n8n avec permissions appropriées
- Claude Code installé

## Étape 1 : Configuration de l'API n8n

### Obtenir votre clé API n8n

1. Connectez-vous à votre instance n8n
2. Allez dans **Settings** → **API**
3. Créez une nouvelle clé API ou copiez une existante
4. Notez l'URL de votre instance n8n

**Exemples d'URL :**
- Instance cloud : `https://votre-instance.app.n8n.cloud`
- Instance locale : `http://localhost:5678`
- Instance Docker : `http://host.docker.internal:5678`

## Étape 2 : Configuration du n8n MCP Server

### Le fichier .mcp.json a déjà été créé

Le fichier `.mcp.json` est présent à la racine du projet. Vous devez maintenant le configurer avec vos credentials :

1. Ouvrez le fichier [.mcp.json](.mcp.json)
2. Remplacez les valeurs suivantes :
   - `YOUR_N8N_INSTANCE_URL` → URL de votre instance n8n
   - `YOUR_N8N_API_KEY` → Votre clé API n8n

**Exemple de configuration complète :**

```json
{
  "mcpServers": {
    "n8n-mcp": {
      "command": "npx",
      "args": ["n8n-mcp"],
      "env": {
        "MCP_MODE": "stdio",
        "LOG_LEVEL": "error",
        "DISABLE_CONSOLE_OUTPUT": "true",
        "N8N_API_URL": "https://mon-instance.app.n8n.cloud",
        "N8N_API_KEY": "n8n_api_xxxxxxxxxxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

### Variables d'environnement importantes

| Variable | Description | Requis | Défaut |
|----------|-------------|--------|--------|
| `MCP_MODE` | Mode de communication (DOIT être "stdio") | ✅ Oui | - |
| `LOG_LEVEL` | Niveau de log (error, warn, info, debug) | Non | info |
| `DISABLE_CONSOLE_OUTPUT` | Désactive les logs console | Non | false |
| `N8N_API_URL` | URL de votre instance n8n | ✅ Oui | - |
| `N8N_API_KEY` | Clé API n8n | ✅ Oui | - |
| `WEBHOOK_SECURITY_MODE` | Sécurité webhooks (strict/moderate/permissive) | Non | strict |

### Configuration avancée (optionnelle)

#### Instance locale avec Docker

Si votre n8n tourne en Docker sur la même machine :

```json
{
  "N8N_API_URL": "http://host.docker.internal:5678",
  "N8N_API_KEY": "votre-clé-api",
  "WEBHOOK_SECURITY_MODE": "moderate"
}
```

#### Optimisation de la base de données

Pour sql.js (si utilisé) :

```json
{
  "SQLJS_SAVE_INTERVAL_MS": "10000"
}
```

#### Désactiver la télémétrie

```json
{
  "N8N_MCP_TELEMETRY_DISABLED": "true"
}
```

### Vérification de l'installation

Une fois configuré, **redémarrez Claude Code** pour charger la nouvelle configuration MCP.

Pour vérifier que le serveur fonctionne, vous pouvez demander à Claude :
```
"Quels nodes n8n sont disponibles pour l'intégration Slack ?"
```

Claude devrait pouvoir accéder au n8n MCP Server et vous répondre avec la liste des nodes.

## Étape 3 : Installation des n8n Skills

### Option 1 : Installation automatique (Recommandée)

Dans Claude Code, exécutez la commande :

```
/plugin install czlonkowski/n8n-skills
```

Cette commande installera automatiquement les 7 skills n8n.

### Option 2 : Installation manuelle

Le repository a déjà été cloné dans le dossier `n8n-skills/`.

Pour une installation manuelle :

1. **Windows :**
   ```bash
   xcopy /E /I "n8n-skills\skills" "%USERPROFILE%\.claude\skills\n8n-skills"
   ```

2. **macOS/Linux :**
   ```bash
   cp -r n8n-skills/skills/* ~/.claude/skills/
   ```

### Vérification des skills installés

Pour voir les skills disponibles dans Claude Code :

```
/skills list
```

Vous devriez voir les 7 skills n8n :

1. **n8n-expression-syntax** - Syntaxe des expressions n8n
2. **n8n-mcp-tools** - Expert des outils MCP (HAUTE PRIORITÉ)
3. **n8n-workflow-patterns** - Patterns de workflows
4. **n8n-validation** - Expert validation
5. **n8n-node-config** - Configuration des nodes
6. **n8n-code-js** - Code JavaScript dans n8n
7. **n8n-code-python** - Code Python dans n8n

## Étape 4 : Test de l'installation complète

### Test 1 : Accès au MCP Server

Demandez à Claude :
```
"Peux-tu me donner la liste des nodes n8n disponibles pour HTTP requests ?"
```

**Résultat attendu :** Claude utilise le n8n MCP Server pour chercher et lister les nodes HTTP.

### Test 2 : Utilisation des Skills

Demandez à Claude :
```
"Comment accéder aux données d'un webhook dans une expression n8n ?"
```

**Résultat attendu :** Le skill "n8n-expression-syntax" s'active et explique la syntaxe `$json.body`.

### Test 3 : Création d'un workflow simple

Demandez à Claude :
```
"Crée un workflow simple qui reçoit un webhook et envoie les données à Slack"
```

**Résultat attendu :** Claude utilise à la fois le MCP Server (pour créer le workflow) et les Skills (pour appliquer les best practices).

## Capacités du n8n MCP Server

Une fois configuré, le MCP Server vous donne accès à :

### Documentation
- **1,084 nodes n8n** (537 core + 547 community)
- 99% de couverture des propriétés avec schémas détaillés
- 87% de couverture documentation officielle
- 265 variants d'outils avec documentation complète

### Templates
- **2,646 configurations pré-extraites** de templates populaires
- **2,709 templates de workflows** avec métadonnées complètes
- Patterns éprouvés pour cas d'usage communs

### Gestion de workflows (avec API)
- Création de nouveaux workflows
- Modification de workflows existants
- Activation/désactivation
- Exécution de tests
- Export/import de workflows

## Capacités des n8n Skills

Les 7 skills fournissent :

### 1. n8n Expression Syntax
- Syntaxe correcte des expressions
- Variables core ($json, $node, $now, $env)
- Erreurs courantes et solutions

### 2. n8n MCP Tools Expert (PRIORITÉ HAUTE)
- Utilisation efficace des outils n8n-mcp
- Sélection des bons outils
- Formats de paramètres

### 3. n8n Workflow Patterns
- 5 patterns architecturaux éprouvés
- Exemples réels de 2,653+ templates
- Best practices d'architecture

### 4. n8n Validation Expert
- Interprétation des erreurs de validation
- Guide de troubleshooting
- Profils de validation (Minimal, Runtime, AI-friendly, Strict)

### 5. n8n Node Configuration
- Configuration par opération
- Règles de dépendances
- Paramètres requis/optionnels

### 6. n8n Code JavaScript
- 10 patterns production-testés
- Syntaxe et limitations
- Accès aux données ($json, $items, etc.)

### 7. n8n Code Python
- Implémentation Python
- Limitations (pas de librairies externes)
- Cas d'usage recommandés

## Points d'attention importants

### ⚠️ SÉCURITÉ CRITIQUE

**JAMAIS éditer directement les workflows de production avec l'IA !**

Toujours :
- Faire une copie avant d'utiliser les outils IA
- Tester en environnement de développement d'abord
- Exporter des backups des workflows importants
- Valider les changements avant déploiement en production

### 🔑 Gotchas importants

1. **Données webhook** : Toujours sous `$json.body` (expressions ET Code nodes)
2. **Format nodeType** : Diffère selon le contexte
   - Format MCP : `nodes-base.*`
   - Format n8n : `n8n-nodes-base.*`
3. **Python Code nodes** :
   - Pas de librairies externes (requests, pandas, numpy)
   - Utiliser JavaScript pour 95% des cas
4. **MCP_MODE** : DOIT être "stdio" sinon erreurs JSON parsing

### 📊 Profils de validation

Choisissez selon votre besoin :
- **Minimal** : Validation basique uniquement
- **Runtime** : Validation à l'exécution
- **AI-friendly** : Optimisé pour IA (recommandé)
- **Strict** : Validation complète (peut être verbeux)

## Dépannage

### Le MCP Server ne se connecte pas

1. Vérifiez que Node.js est installé : `node --version`
2. Vérifiez le fichier `.mcp.json` (syntaxe JSON valide)
3. Vérifiez que `MCP_MODE` est bien "stdio"
4. Redémarrez Claude Code
5. Vérifiez les logs dans Claude Code

### Les Skills ne s'activent pas

1. Vérifiez l'installation : `/skills list`
2. Réinstallez si nécessaire : `/plugin install czlonkowski/n8n-skills`
3. Redémarrez Claude Code
4. Essayez une requête spécifique qui devrait activer un skill

### Erreurs d'API n8n

1. Vérifiez que l'URL n8n est accessible
2. Vérifiez que la clé API est valide
3. Vérifiez les permissions de la clé API
4. Testez l'API manuellement : `curl -H "X-N8N-API-KEY: votre-clé" URL/api/v1/workflows`

### Erreurs JSON parsing

- Vérifiez que `MCP_MODE: "stdio"` est bien défini
- Vérifiez que `DISABLE_CONSOLE_OUTPUT: "true"` est défini
- Vérifiez qu'il n'y a pas de logs sur stdout

## Ressources supplémentaires

- **n8n MCP Server** : https://github.com/czlonkowski/n8n-mcp
- **n8n Skills** : https://github.com/czlonkowski/n8n-skills
- **Documentation MCP** : https://www.n8n-mcp.com
- **Documentation n8n** : https://docs.n8n.io
- **Community n8n** : https://community.n8n.io

## Support

Si vous rencontrez des problèmes :

1. Consultez ce guide d'installation
2. Vérifiez les logs de Claude Code
3. Consultez les issues GitHub des projets
4. Demandez de l'aide dans la community n8n

---

**Configuration initiale complétée !** Vous êtes maintenant prêt à créer des workflows n8n de haute qualité avec Claude Code.
