const https = require('https');
const config = require('./config');

// Charger et valider la configuration
config.validate();

// Workflow avec placeholder - vous ajouterez le code dans l'interface
const workflow = {
  name: "🚀 Deploy Bot Gemini",
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
        jsCode: "// TODO: Coller le code de déploiement ici\nreturn { message: 'Workflow créé - éditez ce node pour ajouter le code de déploiement' };"
      },
      name: "Deploy Bot (Éditer ce node)",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [450, 300]
    }
  ],
  connections: {
    Start: {
      main: [[{ node: "Deploy Bot (Éditer ce node)", type: "main", index: 0 }]]
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

console.log('🚀 Création du workflow shell...\n');

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => { body += chunk; });
  res.on('end', () => {
    if (res.statusCode === 200 || res.statusCode === 201) {
      const response = JSON.parse(body);
      const workflowUrl = `https://n8n.srv1289936.hstgr.cloud/workflow/${response.id}`;

      console.log('✅ Workflow créé!');
      console.log(`🔗 URL: ${workflowUrl}\n`);
      console.log('📋 ÉTAPES SUIVANTES:\n');
      console.log('1. Ouvrez le workflow dans votre navigateur');
      console.log('2. Cliquez sur le node "Deploy Bot (Éditer ce node)"');
      console.log('3. Remplacez le code placeholder par le code ci-dessous:');
      console.log('\n--- CODE À COPIER ---\n');
      console.log(`const fs = require('fs');
const { execSync } = require('child_process');

const botCode = \`const { Telegraf } = require('telegraf');
const axios = require('axios');
const BOT_TOKEN = '8510817329:AAE72JsuTE_r-sAnclrNN5APE1wIDeKKGXE';
const N8N_API = 'https://n8n.srv1289936.hstgr.cloud/api/v1/workflows';
const N8N_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4YWVhYjY1Ny04ZDU0LTRmYTQtYWYzYi0zYzQzODM3ZWY0MWMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiOTIxMmNjOWUtYTBiMC00ZjkxLWI1MjgtYjk3MDI3NjJkNTY3IiwiaWF0IjoxNzcwMzg0NDA3fQ.bU1XT4VoSyMVQOSV4byi5tMTjMZDacb9T_g44VPQ_jI';

const bot = new Telegraf(BOT_TOKEN);

bot.command('n8n', async (ctx) => {
  const msg = ctx.message.text.replace('/n8n', '').trim();
  if (!msg) return ctx.reply('Usage: /n8n <message>');
  try {
    const workflow = { name: \\\`Auto-\\\${Date.now()}\\\`, nodes: [{ parameters: {}, name: 'Start', type: 'n8n-nodes-base.manualTrigger', typeVersion: 1, position: [250, 300] }, { parameters: { values: { string: [{ name: 'request', value: msg }] } }, name: 'Data', type: 'n8n-nodes-base.set', typeVersion: 3.4, position: [450, 300] }], connections: { 'Start': { main: [[{ node: 'Data', type: 'main', index: 0 }]] } } };
    const res = await axios.post(N8N_API, workflow, { headers: { 'X-N8N-API-KEY': N8N_KEY, 'Content-Type': 'application/json' } });
    ctx.reply(\\\`✅ Workflow créé!\\\\nID: \\\${res.data.id}\\\\nURL: https://n8n.srv1289936.hstgr.cloud/workflow/\\\${res.data.id}\\\`);
  } catch (err) { ctx.reply(\\\`❌ Erreur: \\\${err.message}\\\`); }
});

bot.start(ctx => ctx.reply('Bot prêt! Utilisez /n8n <message>'));
bot.launch();
console.log('✅ Bot démarré');
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
\`;

try {
  fs.writeFileSync('/root/frankito-bot/bot.js', botCode);
  execSync('cd /root/frankito-bot && pm2 restart all');
  return { success: true, message: '✅ Bot déployé et redémarré!' };
} catch (e) {
  return { success: false, error: e.message };
}`);
      console.log('\n--- FIN DU CODE ---\n');
      console.log('4. Cliquez "Save" puis "Execute Workflow"');
      console.log('5. Testez dans Telegram: /n8n test\n');
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
