# 🔌 MCP Resources - Frankito-IA

Ce dossier contient les ressources et configurations pour les serveurs MCP (Model Context Protocol).

## 📂 Structure

```
mcp-resources/
├── configs/          # Configurations MCP
├── tools/            # Outils MCP personnalisés
├── prompts/          # Prompts réutilisables
└── schemas/          # Schémas et définitions
```

## 🛠️ MCP Servers Configurés

### N8N MCP Server
- **Description:** Serveur MCP pour interagir avec N8N
- **Configuration:** Voir `.mcp.json` à la racine
- **Outils disponibles:**
  - Gestion des workflows
  - Exécution de workflows
  - Gestion des credentials

### Configuration Actuelle

La configuration MCP principale se trouve dans `.mcp.json` à la racine du projet.

**Serveurs actifs:**
- `n8n-mcp` - Interaction avec l'instance N8N

## 📝 Utilisation

### Avec Claude Code

Les serveurs MCP sont automatiquement chargés par Claude Code via le fichier `.mcp.json`.

### Configuration Manuelle

Pour configurer un nouveau serveur MCP:

1. Ajouter la configuration dans `.mcp.json`
2. Installer les dépendances si nécessaire
3. Redémarrer Claude Code

## 🔗 Ressources

### Documentation Officielle
- [MCP Documentation](https://modelcontextprotocol.io)
- [N8N MCP Server](https://github.com/your-n8n-mcp)

### Fichiers Liés
- Configuration: `../.mcp.json`
- N8N Config: `../config.js`
- Environment: `../.env`

## 📦 Ressources Futures

Ce dossier est préparé pour accueillir:
- Templates de prompts MCP
- Outils MCP personnalisés
- Schémas de validation
- Configurations de serveurs additionnels

---
**Version:** 1.0.0
**Dernière mise à jour:** 2026-02-07
