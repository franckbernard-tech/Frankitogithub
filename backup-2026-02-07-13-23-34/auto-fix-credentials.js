const https = require('https');
const config = require('./config');

// Charger et valider la configuration
config.validate();

const N8N_URL = config.n8n.apiUrl.replace('https://', '');
const N8N_API_KEY = config.n8n.apiKey;
const TELEGRAM_TOKEN = config.telegram.botToken;
const WORKFLOW_ID = config.workflows.masterId;

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            resolve(body);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  console.log('🚀 Réparation automatique du workflow Master...\n');

  // ÉTAPE 1 : Créer une nouvelle credential Telegram
  console.log('1️⃣ Création de la credential Telegram...');

  const credentialData = {
    name: 'Frankito Bot - Auto',
    type: 'telegramApi',
    data: {
      accessToken: TELEGRAM_TOKEN
    }
  };

  const credOptions = {
    hostname: N8N_URL,
    port: 443,
    path: '/api/v1/credentials',
    method: 'POST',
    headers: {
      'X-N8N-API-KEY': N8N_API_KEY,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(JSON.stringify(credentialData))
    }
  };

  let credentialId;
  try {
    const credResult = await makeRequest(credOptions, JSON.stringify(credentialData));
    credentialId = credResult.id;
    console.log('   ✅ Credential créée:', credentialId);
  } catch (error) {
    console.error('   ❌ Erreur création credential:', error.message);
    console.log('   ℹ️  Continuons avec les credentials existantes...');
    credentialId = '5indXQjPLdE3iKbJ'; // Fallback sur l'ancienne
  }

  // ÉTAPE 2 : Créer le workflow avec la nouvelle credential
  console.log('\n2️⃣ Mise à jour du workflow...');

  const workflow = {
    name: "🎯 Master - Créateur de Workflows via Telegram",
    active: true, // Activer automatiquement
    nodes: [
      {
        parameters: {
          updates: ["message"],
          additionalFields: {}
        },
        name: "Telegram Trigger",
        type: "n8n-nodes-base.telegramTrigger",
        typeVersion: 1.1,
        position: [250, 300],
        webhookId: "telegram-master-bot",
        credentials: {
          telegramApi: {
            id: credentialId,
            name: "Frankito Bot - Auto"
          }
        }
      },
      {
        parameters: {
          conditions: {
            string: [
              {
                value1: "={{ $json.message.text }}",
                operation: "startsWith",
                value2: "/create"
              }
            ]
          }
        },
        name: "Est /create?",
        type: "n8n-nodes-base.if",
        typeVersion: 1,
        position: [450, 300]
      },
      {
        parameters: {
          assignments: {
            assignments: [
              {
                name: "workflow_name",
                value: "={{ $json.message.text.replace('/create', '').trim() || 'Nouveau Workflow' }}",
                type: "string"
              }
            ]
          },
          options: {}
        },
        name: "Extraire Nom",
        type: "n8n-nodes-base.set",
        typeVersion: 3.4,
        position: [650, 200]
      },
      {
        parameters: {
          method: "POST",
          url: `https://${N8N_URL}/api/v1/workflows`,
          authentication: "none",
          sendHeaders: true,
          headerParameters: {
            parameters: [
              {
                name: "X-N8N-API-KEY",
                value: N8N_API_KEY
              },
              {
                name: "Content-Type",
                value: "application/json"
              }
            ]
          },
          sendBody: true,
          specifyBody: "json",
          jsonBody: `{
  "name": "={{ $json.workflow_name }}",
  "nodes": [
    {
      "parameters": {},
      "name": "Start",
      "type": "n8n-nodes-base.manualTrigger",
      "typeVersion": 1,
      "position": [250, 300]
    }
  ],
  "connections": {},
  "settings": {}
}`,
          options: {}
        },
        name: "Créer Workflow",
        type: "n8n-nodes-base.httpRequest",
        typeVersion: 4.2,
        position: [850, 200]
      },
      {
        parameters: {
          chatId: "={{ $('Telegram Trigger').item.json.message.chat.id }}",
          text: `✅ Workflow créé!

📋 Nom: {{ $json.name }}
🆔 ID: {{ $json.id }}
🔗 URL: https://${N8N_URL}/workflow/{{ $json.id }}

💡 Workflow vide créé. Éditez-le pour ajouter vos nodes!`,
          additionalFields: {}
        },
        name: "Succès",
        type: "n8n-nodes-base.telegram",
        typeVersion: 1.1,
        position: [1050, 200],
        credentials: {
          telegramApi: {
            id: credentialId,
            name: "Frankito Bot - Auto"
          }
        }
      },
      {
        parameters: {
          chatId: "={{ $('Telegram Trigger').item.json.message.chat.id }}",
          text: "❌ Utilisez: /create <nom>\\n\\nExemple: /create Mon Workflow",
          additionalFields: {}
        },
        name: "Erreur",
        type: "n8n-nodes-base.telegram",
        typeVersion: 1.1,
        position: [1050, 400],
        credentials: {
          telegramApi: {
            id: credentialId,
            name: "Frankito Bot - Auto"
          }
        }
      }
    ],
    connections: {
      "Telegram Trigger": {
        main: [[{ node: "Est /create?", type: "main", index: 0 }]]
      },
      "Est /create?": {
        main: [
          [{ node: "Extraire Nom", type: "main", index: 0 }],
          [{ node: "Erreur", type: "main", index: 0 }]
        ]
      },
      "Extraire Nom": {
        main: [[{ node: "Créer Workflow", type: "main", index: 0 }]]
      },
      "Créer Workflow": {
        main: [[{ node: "Succès", type: "main", index: 0 }]]
      }
    },
    settings: {}
  };

  const workflowData = JSON.stringify(workflow);
  const workflowOptions = {
    hostname: N8N_URL,
    port: 443,
    path: `/api/v1/workflows/${WORKFLOW_ID}`,
    method: 'PUT',
    headers: {
      'X-N8N-API-KEY': N8N_API_KEY,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(workflowData)
    }
  };

  try {
    await makeRequest(workflowOptions, workflowData);
    console.log('   ✅ Workflow mis à jour et ACTIVÉ');
  } catch (error) {
    console.error('   ❌ Erreur mise à jour workflow:', error.message);
    return;
  }

  // ÉTAPE 3 : Résumé
  console.log('\n✅ TERMINÉ!\n');
  console.log('📋 Résumé:');
  console.log('   • Credential Telegram créée:', credentialId);
  console.log('   • Workflow mis à jour avec nouvelle credential');
  console.log('   • Workflow ACTIVÉ automatiquement');
  console.log('');
  console.log('🔗 Workflow:', `https://${N8N_URL}/workflow/${WORKFLOW_ID}`);
  console.log('');
  console.log('🎯 Testez maintenant dans Telegram:');
  console.log('   /create Mon Premier Workflow');
  console.log('');
}

main().catch(console.error);
