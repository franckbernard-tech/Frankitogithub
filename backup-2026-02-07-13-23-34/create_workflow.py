#!/usr/bin/env python3
import requests
import json

# Code du bot (échappé proprement)
bot_code = r"""const { Telegraf } = require('telegraf');
const axios = require('axios');
const BOT_TOKEN = '8510817329:AAE72JsuTE_r-sAnclrNN5APE1wIDeKKGXE';
const N8N_API = 'https://n8n.srv1289936.hstgr.cloud/api/v1/workflows';
const N8N_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4YWVhYjY1Ny04ZDU0LTRmYTQtYWYzYi0zYzQzODM3ZWY0MWMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiOTIxMmNjOWUtYTBiMC00ZjkxLWI1MjgtYjk3MDI3NjJkNTY3IiwiaWF0IjoxNzcwMzg0NDA3fQ.bU1XT4VoSyMVQOSV4byi5tMTjMZDacb9T_g44VPQ_jI';

const bot = new Telegraf(BOT_TOKEN);

bot.command('n8n', async (ctx) => {
  const msg = ctx.message.text.replace('/n8n', '').trim();
  if (!msg) return ctx.reply('Usage: /n8n <message>');

  try {
    const workflow = {
      name: `Auto-${Date.now()}`,
      nodes: [
        { parameters: {}, name: 'Start', type: 'n8n-nodes-base.manualTrigger', typeVersion: 1, position: [250, 300] },
        { parameters: { values: { string: [{ name: 'request', value: msg }] } }, name: 'Data', type: 'n8n-nodes-base.set', typeVersion: 3.4, position: [450, 300] }
      ],
      connections: { 'Start': { main: [[{ node: 'Data', type: 'main', index: 0 }]] } }
    };

    const res = await axios.post(N8N_API, workflow, {
      headers: { 'X-N8N-API-KEY': N8N_KEY, 'Content-Type': 'application/json' }
    });

    ctx.reply(`✅ Workflow créé!\nID: ${res.data.id}\nURL: https://n8n.srv1289936.hstgr.cloud/workflow/${res.data.id}`);
  } catch (err) {
    ctx.reply(`❌ Erreur: ${err.message}`);
  }
});

bot.start(ctx => ctx.reply('Bot prêt! Utilisez /n8n <message>'));
bot.launch();
console.log('✅ Bot démarré');
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
"""

# Code node qui déploie le bot
deploy_code = f"""const fs = require('fs');
const {{ execSync }} = require('child_process');

const botCode = `{bot_code}`;

const results = {{
  timestamp: new Date().toISOString(),
  steps: []
}};

try {{
  const botDir = '/root/frankito-bot';
  const botFile = botDir + '/bot.js';

  results.steps.push('📁 Vérification répertoire...');
  if (!fs.existsSync(botDir)) {{
    results.steps.push('❌ Répertoire inexistant');
    results.success = false;
    return results;
  }}

  results.steps.push('💾 Backup...');
  if (fs.existsSync(botFile)) {{
    fs.copyFileSync(botFile, botFile + '.backup.' + Date.now());
  }}

  results.steps.push('✍️ Écriture bot.js...');
  fs.writeFileSync(botFile, botCode, {{ encoding: 'utf-8' }});
  results.file_written = botFile;
  results.file_size = botCode.length;

  results.steps.push('🔄 Restart PM2...');
  const output = execSync('cd ' + botDir + ' && pm2 restart all', {{ encoding: 'utf-8', timeout: 15000 }});
  results.pm2_output = output;

  results.steps.push('✅ Déploiement réussi!');
  results.success = true;
}} catch (e) {{
  results.steps.push('❌ Erreur: ' + e.message);
  results.error = e.message;
  results.success = false;
}}

return results;
"""

# Workflow complet
workflow = {
    "name": "🚀 Deploy Bot Gemini - API",
    "nodes": [
        {
            "parameters": {},
            "name": "Start",
            "type": "n8n-nodes-base.manualTrigger",
            "typeVersion": 1,
            "position": [250, 300]
        },
        {
            "parameters": {
                "jsCode": deploy_code
            },
            "name": "Deploy Bot",
            "type": "n8n-nodes-base.code",
            "typeVersion": 2,
            "position": [450, 300]
        },
        {
            "parameters": {
                "conditions": {
                    "string": [
                        {
                            "value1": "={{ $json.success }}",
                            "value2": "true"
                        }
                    ]
                }
            },
            "name": "Success?",
            "type": "n8n-nodes-base.if",
            "typeVersion": 1,
            "position": [650, 300]
        },
        {
            "parameters": {
                "values": {
                    "string": [
                        {"name": "status", "value": "✅ SUCCÈS"},
                        {"name": "file", "value": "={{ $json.file_written }}"},
                        {"name": "size", "value": "={{ $json.file_size }} bytes"},
                        {"name": "steps", "value": "={{ $json.steps.join('\\n') }}"}
                    ]
                }
            },
            "name": "✅ Success",
            "type": "n8n-nodes-base.set",
            "typeVersion": 1,
            "position": [850, 200]
        },
        {
            "parameters": {
                "values": {
                    "string": [
                        {"name": "status", "value": "❌ ÉCHEC"},
                        {"name": "error", "value": "={{ $json.error }}"},
                        {"name": "steps", "value": "={{ $json.steps.join('\\n') }}"}
                    ]
                }
            },
            "name": "❌ Error",
            "type": "n8n-nodes-base.set",
            "typeVersion": 1,
            "position": [850, 400]
        }
    ],
    "connections": {
        "Start": {
            "main": [[{"node": "Deploy Bot", "type": "main", "index": 0}]]
        },
        "Deploy Bot": {
            "main": [[{"node": "Success?", "type": "main", "index": 0}]]
        },
        "Success?": {
            "main": [
                [{"node": "✅ Success", "type": "main", "index": 0}],
                [{"node": "❌ Error", "type": "main", "index": 0}]
            ]
        }
    }
}

# Créer le workflow via API
url = "https://n8n.srv1289936.hstgr.cloud/api/v1/workflows"
headers = {
    "X-N8N-API-KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4YWVhYjY1Ny04ZDU0LTRmYTQtYWYzYi0zYzQzODM3ZWY0MWMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiOTIxMmNjOWUtYTBiMC00ZjkxLWI1MjgtYjk3MDI3NjJkNTY3IiwiaWF0IjoxNzcwMzg0NDA3fQ.bU1XT4VoSyMVQOSV4byi5tMTjMZDacb9T_g44VPQ_jI",
    "Content-Type": "application/json"
}

print("🚀 Création du workflow via API n8n...")
print(f"📡 URL: {url}")
print()

response = requests.post(url, headers=headers, json=workflow)

if response.status_code in [200, 201]:
    data = response.json()
    workflow_id = data.get('id')
    workflow_url = f"https://n8n.srv1289936.hstgr.cloud/workflow/{workflow_id}"

    print("✅ SUCCÈS!")
    print(f"🆔 Workflow ID: {workflow_id}")
    print(f"📛 Nom: {data.get('name')}")
    print(f"🔗 URL: {workflow_url}")
    print()
    print("🎯 PROCHAINES ÉTAPES:")
    print(f"1. Ouvrez: {workflow_url}")
    print("2. Cliquez sur 'Execute Workflow'")
    print("3. Vérifiez le résultat")
    print("4. Testez le bot dans Telegram: /n8n test")
else:
    print(f"❌ ÉCHEC: {response.status_code}")
    print(f"Message: {response.text}")
