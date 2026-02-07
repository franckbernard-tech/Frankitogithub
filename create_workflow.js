const https = require('https');
const config = require('./config');

// Charger et valider la configuration
config.validate();

// Code du bot
const botCode = `const { Telegraf } = require('telegraf');
const axios = require('axios');
const config = require('./config');

// Charger et valider la configuration
config.validate();

const BOT_TOKEN = config.telegram.botToken;
const N8N_API = \`\${config.n8n.apiUrl}/api/v1/workflows\`;
const N8N_KEY = config.n8n.apiKey;

const bot = new Telegraf(BOT_TOKEN);

bot.command('n8n', async (ctx) => {
  const msg = ctx.message.text.replace('/n8n', '').trim();
  if (!msg) return ctx.reply('Usage: /n8n <message>');

  try {
    const workflow = {
      name: \`Auto-\${Date.now()}\`,
      nodes: [
        { parameters: {}, name: 'Start', type: 'n8n-nodes-base.manualTrigger', typeVersion: 1, position: [250, 300] },
        { parameters: { values: { string: [{ name: 'request', value: msg }] } }, name: 'Data', type: 'n8n-nodes-base.set', typeVersion: 3.4, position: [450, 300] }
      ],
      connections: { 'Start': { main: [[{ node: 'Data', type: 'main', index: 0 }]] } }
    };

    const res = await axios.post(N8N_API, workflow, {
      headers: { 'X-N8N-API-KEY': N8N_KEY, 'Content-Type': 'application/json' }
    });

    ctx.reply(\`✅ Workflow créé!\\nID: \${res.data.id}\\nURL: https://n8n.srv1289936.hstgr.cloud/workflow/\${res.data.id}\`);
  } catch (err) {
    ctx.reply(\`❌ Erreur: \${err.message}\`);
  }
});

bot.start(ctx => ctx.reply('Bot prêt! Utilisez /n8n <message>'));
bot.launch();
console.log('✅ Bot démarré');
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
`;

// Code node qui déploie
const deployCode = `const fs = require('fs');
const { execSync } = require('child_process');

const botCode = \`${botCode.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;

const results = {
  timestamp: new Date().toISOString(),
  steps: []
};

try {
  const botDir = '/root/frankito-bot';
  const botFile = botDir + '/bot.js';

  results.steps.push('📁 Vérification répertoire...');
  if (!fs.existsSync(botDir)) {
    results.steps.push('❌ Répertoire inexistant');
    results.success = false;
    return results;
  }

  results.steps.push('💾 Backup...');
  if (fs.existsSync(botFile)) {
    fs.copyFileSync(botFile, botFile + '.backup.' + Date.now());
  }

  results.steps.push('✍️ Écriture bot.js...');
  fs.writeFileSync(botFile, botCode, { encoding: 'utf-8' });
  results.file_written = botFile;
  results.file_size = botCode.length;

  results.steps.push('🔄 Restart PM2...');
  const output = execSync('cd ' + botDir + ' && pm2 restart all', { encoding: 'utf-8', timeout: 15000 });
  results.pm2_output = output;

  results.steps.push('✅ Déploiement réussi!');
  results.success = true;
} catch (e) {
  results.steps.push('❌ Erreur: ' + e.message);
  results.error = e.message;
  results.success = false;
}

return results;
`;

// Workflow complet
const workflow = {
  name: "🚀 Deploy Bot Gemini - API",
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
        jsCode: deployCode
      },
      name: "Deploy Bot",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [450, 300]
    },
    {
      parameters: {
        conditions: {
          string: [
            {
              value1: "={{ $json.success }}",
              value2: "true"
            }
          ]
        }
      },
      name: "Success?",
      type: "n8n-nodes-base.if",
      typeVersion: 1,
      position: [650, 300]
    },
    {
      parameters: {
        values: {
          string: [
            { name: "status", value: "✅ SUCCÈS" },
            { name: "file", value: "={{ $json.file_written }}" },
            { name: "size", value: "={{ $json.file_size }} bytes" },
            { name: "steps", value: "={{ $json.steps.join('\\n') }}" }
          ]
        }
      },
      name: "✅ Success",
      type: "n8n-nodes-base.set",
      typeVersion: 1,
      position: [850, 200]
    },
    {
      parameters: {
        values: {
          string: [
            { name: "status", value: "❌ ÉCHEC" },
            { name: "error", value: "={{ $json.error }}" },
            { name: "steps", value: "={{ $json.steps.join('\\n') }}" }
          ]
        }
      },
      name: "❌ Error",
      type: "n8n-nodes-base.set",
      typeVersion: 1,
      position: [850, 400]
    }
  ],
  connections: {
    Start: {
      main: [[{ node: "Deploy Bot", type: "main", index: 0 }]]
    },
    "Deploy Bot": {
      main: [[{ node: "Success?", type: "main", index: 0 }]]
    },
    "Success?": {
      main: [
        [{ node: "✅ Success", type: "main", index: 0 }],
        [{ node: "❌ Error", type: "main", index: 0 }]
      ]
    }
  },
  settings: {}
};

// Faire la requête
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

console.log('🚀 Création du workflow via API n8n...');
console.log('📡 URL: https://n8n.srv1289936.hstgr.cloud/api/v1/workflows');
console.log('');

const req = https.request(options, (res) => {
  let body = '';

  res.on('data', (chunk) => {
    body += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200 || res.statusCode === 201) {
      const response = JSON.parse(body);
      const workflowId = response.id;
      const workflowUrl = `https://n8n.srv1289936.hstgr.cloud/workflow/${workflowId}`;

      console.log('✅ SUCCÈS!');
      console.log(`🆔 Workflow ID: ${workflowId}`);
      console.log(`📛 Nom: ${response.name}`);
      console.log(`🔗 URL: ${workflowUrl}`);
      console.log('');
      console.log('🎯 PROCHAINES ÉTAPES:');
      console.log(`1. Ouvrez: ${workflowUrl}`);
      console.log('2. Cliquez sur "Execute Workflow"');
      console.log('3. Vérifiez le résultat');
      console.log('4. Testez le bot dans Telegram: /n8n test');
    } else {
      console.log(`❌ ÉCHEC: ${res.statusCode}`);
      console.log(`Message: ${body}`);
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Erreur requête: ${e.message}`);
});

req.write(data);
req.end();
