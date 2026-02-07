const https = require('https');
const config = require('./config');

// Charger et valider la configuration
config.validate();

const N8N_URL = config.n8n.apiUrl.replace('https://', '');
const N8N_API_KEY = config.n8n.apiKey;
const WORKFLOW_ID = config.workflows.masterId;
const CRED_ID = config.n8n.telegramCredentialId;
const AUTHORIZED_CHAT_ID = config.telegram.authorizedChatId;

const workflow = {
  name: "🎯 Master - Créateur de Workflows via Telegram",
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
          id: CRED_ID,
          name: "Frankito Bot - Auto"
        }
      }
    },
    {
      parameters: {
        conditions: {
          number: [
            {
              value1: "={{ $json.message.chat.id }}",
              operation: "equal",
              value2: AUTHORIZED_CHAT_ID
            }
          ]
        }
      },
      name: "Vérifier Autorisation",
      type: "n8n-nodes-base.if",
      typeVersion: 1,
      position: [450, 300]
    },
    {
      parameters: {
        chatId: "={{ $json.message.chat.id }}",
        text: "❌ Non autorisé\\n\\nVous n'avez pas la permission d'utiliser ce bot.",
        additionalFields: {}
      },
      name: "Non Autorisé",
      type: "n8n-nodes-base.telegram",
      typeVersion: 1.1,
      position: [650, 400],
      credentials: {
        telegramApi: {
          id: CRED_ID,
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
      position: [650, 200]
    },
    {
      parameters: {
        assignments: {
          assignments: [
            {
              name: "workflow_name",
              value: "={{ $json.message.text.replace('/create', '').trim() || 'Nouveau Workflow' }}",
              type: "string"
            },
            {
              name: "chat_id",
              value: "={{ $json.message.chat.id }}",
              type: "string"
            }
          ]
        },
        options: {}
      },
      name: "Extraire Nom",
      type: "n8n-nodes-base.set",
      typeVersion: 3.4,
      position: [850, 100]
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
      position: [1050, 100]
    },
    {
      parameters: {
        chatId: "={{ $('Extraire Nom').item.json.chat_id }}",
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
      position: [1250, 100],
      credentials: {
        telegramApi: {
          id: CRED_ID,
          name: "Frankito Bot - Auto"
        }
      }
    },
    {
      parameters: {
        chatId: "={{ $json.message.chat.id }}",
        text: "❌ Utilisez: /create <nom>\\n\\nExemple: /create Mon Workflow",
        additionalFields: {}
      },
      name: "Erreur",
      type: "n8n-nodes-base.telegram",
      typeVersion: 1.1,
      position: [850, 300],
      credentials: {
        telegramApi: {
          id: CRED_ID,
          name: "Frankito Bot - Auto"
        }
      }
    }
  ],
  connections: {
    "Telegram Trigger": {
      main: [[{ node: "Vérifier Autorisation", type: "main", index: 0 }]]
    },
    "Vérifier Autorisation": {
      main: [
        [{ node: "Est /create?", type: "main", index: 0 }],
        [{ node: "Non Autorisé", type: "main", index: 0 }]
      ]
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

console.log('🔐 Ajout de la sécurité au workflow Master...\n');
console.log('✅ Chat ID autorisé:', AUTHORIZED_CHAT_ID);
console.log('📝 Nouvelle architecture:');
console.log('   1. Telegram Trigger');
console.log('   2. Vérifier Autorisation (Chat ID = 673173233)');
console.log('   3. Si autorisé → Est /create?');
console.log('   4. Si non autorisé → Message de refus\n');

const data = JSON.stringify(workflow);
const options = {
  hostname: N8N_URL,
  port: 443,
  path: `/api/v1/workflows/${WORKFLOW_ID}`,
  method: 'PUT',
  headers: {
    'X-N8N-API-KEY': N8N_API_KEY,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => { body += chunk; });
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ Sécurité ajoutée avec succès!\n');
      console.log('🔗 https://n8n.srv1289936.hstgr.cloud/workflow/' + WORKFLOW_ID);
      console.log('\n🔐 Le workflow est maintenant sécurisé:');
      console.log('   • Seul le Chat ID 673173233 peut créer des workflows');
      console.log('   • Les autres utilisateurs reçoivent un message de refus');
      console.log('\n🎯 Testez depuis Telegram: /create Mon Test Sécurisé\n');
    } else {
      console.error('❌ Erreur:', res.statusCode);
      console.log(body);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Erreur:', e.message);
});

req.write(data);
req.end();
