const https = require('https');
const config = require('./config');

// Charger et valider la configuration
config.validate();

// Configuration
const N8N_URL = config.n8n.apiUrl.replace('https://', '');
const N8N_API_KEY = config.n8n.apiKey;
const TELEGRAM_TOKEN = config.telegram.botToken;

// Workflow Master qui permet de créer d'autres workflows depuis Telegram
const masterWorkflow = {
  name: "🎯 Master - Créateur de Workflows via Telegram",
  nodes: [
    {
      parameters: {
        updates: ["message"]
      },
      name: "Telegram Trigger",
      type: "n8n-nodes-base.telegramTrigger",
      typeVersion: 1.1,
      position: [250, 300],
      webhookId: "telegram-master-bot",
      credentials: {
        telegramApi: {
          id: "1",
          name: "Telegram Bot API"
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
      name: "Est-ce une commande /create?",
      type: "n8n-nodes-base.if",
      typeVersion: 1,
      position: [450, 300]
    },
    {
      parameters: {
        method: "POST",
        url: `https://${N8N_URL}/api/v1/workflows`,
        authentication: "genericCredentialType",
        genericAuthType: "httpHeaderAuth",
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
        bodyParameters: {
          parameters: [
            {
              name: "name",
              value: "={{ $json.message.text.replace('/create ', '') }}"
            },
            {
              name: "nodes",
              value: `={{
                JSON.stringify([
                  {
                    parameters: {},
                    name: "Start",
                    type: "n8n-nodes-base.manualTrigger",
                    typeVersion: 1,
                    position: [250, 300]
                  },
                  {
                    parameters: {
                      values: {
                        string: [
                          {
                            name: "message",
                            value: "Workflow créé par Master Bot"
                          },
                          {
                            name: "created_at",
                            value: "={{ $now.toISO() }}"
                          }
                        ]
                      }
                    },
                    name: "Data",
                    type: "n8n-nodes-base.set",
                    typeVersion: 1,
                    position: [450, 300]
                  }
                ])
              }}`
            },
            {
              name: "connections",
              value: `={{
                JSON.stringify({
                  "Start": {
                    main: [[{ node: "Data", type: "main", index: 0 }]]
                  }
                })
              }}`
            },
            {
              name: "settings",
              value: "{}"
            }
          ]
        },
        options: {
          response: {
            response: {
              fullResponse: false,
              responseFormat: "json"
            }
          }
        }
      },
      name: "Créer Workflow via API",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4.2,
      position: [650, 200]
    },
    {
      parameters: {
        chatId: "={{ $('Telegram Trigger').item.json.message.chat.id }}",
        text: "={{ '✅ Workflow créé!\\n\\nNom: ' + $json.name + '\\nID: ' + $json.id + '\\nURL: https://" + N8N_URL + "/workflow/' + $json.id }}",
        additionalFields: {}
      },
      name: "Réponse Succès",
      type: "n8n-nodes-base.telegram",
      typeVersion: 1.1,
      position: [850, 200],
      credentials: {
        telegramApi: {
          id: "1",
          name: "Telegram Bot API"
        }
      }
    },
    {
      parameters: {
        chatId: "={{ $('Telegram Trigger').item.json.message.chat.id }}",
        text: "❌ Commande non reconnue.\\n\\nUtilisez:\\n/create <nom du workflow>\\n\\nExemple:\\n/create Mon Workflow Test",
        additionalFields: {}
      },
      name: "Réponse Erreur",
      type: "n8n-nodes-base.telegram",
      typeVersion: 1.1,
      position: [850, 400],
      credentials: {
        telegramApi: {
          id: "1",
          name: "Telegram Bot API"
        }
      }
    }
  ],
  connections: {
    "Telegram Trigger": {
      main: [[{ node: "Est-ce une commande /create?", type: "main", index: 0 }]]
    },
    "Est-ce une commande /create?": {
      main: [
        [{ node: "Créer Workflow via API", type: "main", index: 0 }],
        [{ node: "Réponse Erreur", type: "main", index: 0 }]
      ]
    },
    "Créer Workflow via API": {
      main: [[{ node: "Réponse Succès", type: "main", index: 0 }]]
    }
  },
  settings: {}
};

console.log('🚀 Création du workflow Master via API n8n...\n');
console.log('📡 URL:', `https://${N8N_URL}/api/v1/workflows`);
console.log('🔑 API Key:', N8N_API_KEY.substring(0, 50) + '...');
console.log('');

const data = JSON.stringify(masterWorkflow);
const options = {
  hostname: N8N_URL,
  port: 443,
  path: '/api/v1/workflows',
  method: 'POST',
  headers: {
    'X-N8N-API-KEY': N8N_API_KEY,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = https.request(options, (res) => {
  let body = '';

  res.on('data', (chunk) => {
    body += chunk;
  });

  res.on('end', () => {
    console.log('📊 Status Code:', res.statusCode);

    if (res.statusCode === 200 || res.statusCode === 201) {
      try {
        const response = JSON.parse(body);
        const workflowId = response.id;
        const workflowUrl = `https://${N8N_URL}/workflow/${workflowId}`;

        console.log('\n✅ SUCCÈS! Workflow Master créé!\n');
        console.log('🆔 Workflow ID:', workflowId);
        console.log('📛 Nom:', response.name);
        console.log('🔗 URL:', workflowUrl);
        console.log('');
        console.log('🎯 PROCHAINES ÉTAPES:\n');
        console.log('1. Ouvrez:', workflowUrl);
        console.log('2. Configurez les credentials Telegram:');
        console.log('   - Cliquez sur "Telegram Trigger"');
        console.log('   - Ajoutez vos credentials Telegram Bot');
        console.log('   - Token:', TELEGRAM_TOKEN);
        console.log('3. Activez le workflow (toggle en haut)');
        console.log('4. Dans Telegram, envoyez:');
        console.log('   /create Mon Premier Workflow');
        console.log('');
        console.log('💡 Le bot créera automatiquement le workflow et vous donnera l\'URL!');

      } catch (e) {
        console.error('❌ Erreur parsing JSON:', e.message);
        console.log('Body:', body);
      }
    } else {
      console.error('\n❌ ÉCHEC:', res.statusCode);
      console.log('Response:', body);

      if (res.statusCode === 500) {
        console.log('\n💡 Le workflow est peut-être trop complexe pour l\'API.');
        console.log('Essayons une version simplifiée...\n');
      }
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Erreur requête:', e.message);
});

req.write(data);
req.end();
