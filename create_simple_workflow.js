const https = require('https');
const config = require('./config');

// Charger et valider la configuration
config.validate();

// Workflow minimal pour test
const workflow = {
  name: "Test API - Simple",
  nodes: [
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
            { name: "message", value: "Hello from API!" },
            { name: "timestamp", value: "={{ $now.toISO() }}" }
          ]
        }
      },
      name: "Set Data",
      type: "n8n-nodes-base.set",
      typeVersion: 1,
      position: [450, 300]
    }
  ],
  connections: {
    Start: {
      main: [[{ node: "Set Data", type: "main", index: 0 }]]
    }
  },
  settings: {}
};

const data = JSON.stringify(workflow);
const options = {
  hostname: config.n8n.apiUrl.replace('https://', ''),
  port: 443,
  path: '/api/v1/workflows',
  method: 'POST',
  headers: {
    'X-N8N-API-KEY': config.n8n.apiKey,
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('🧪 Test de l\'API n8n avec workflow minimal...\n');

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => { body += chunk; });
  res.on('end', () => {
    if (res.statusCode === 200 || res.statusCode === 201) {
      const response = JSON.parse(body);
      console.log('✅ API fonctionne!');
      console.log(`🆔 ID: ${response.id}`);
      console.log(`🔗 URL: https://n8n.srv1289936.hstgr.cloud/workflow/${response.id}\n`);
      console.log('👉 Workflow créé avec succès. Vous pouvez maintenant créer le workflow de déploiement manuellement.');
    } else {
      console.log(`❌ Erreur: ${res.statusCode}`);
      console.log(body);
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Erreur: ${e.message}`);
});

req.write(data);
req.end();
