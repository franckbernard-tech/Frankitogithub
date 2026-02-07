/**
 * Health Check - Validation de la configuration Frankito-IA
 *
 * Vérifie que tous les composants sont correctement configurés
 */

const https = require('https');
const fs = require('fs');

console.log('🏥 DIAGNOSTIC FRANKITO-IA\n');
console.log('='.repeat(50));

// Résultats du diagnostic
const results = {
  config: { status: '⏳', message: 'En cours...', critical: true },
  envFile: { status: '⏳', message: 'En cours...', critical: true },
  n8nConnection: { status: '⏳', message: 'En cours...', critical: true },
  telegramBot: { status: '⏳', message: 'En cours...', critical: false },
  workflow: { status: '⏳', message: 'En cours...', critical: false }
};

// Test 1: Vérifier que .env existe
console.log('\n1️⃣ Vérification du fichier .env...');
try {
  if (fs.existsSync('.env')) {
    results.envFile.status = '✅';
    results.envFile.message = 'Fichier .env trouvé';
    console.log('   ✅ Fichier .env existe');
  } else {
    results.envFile.status = '❌';
    results.envFile.message = 'Fichier .env manquant';
    console.log('   ❌ Fichier .env manquant');
    console.log('   💡 Créez-le avec: cp .env.template .env');
  }
} catch (error) {
  results.envFile.status = '❌';
  results.envFile.message = error.message;
  console.log('   ❌ Erreur:', error.message);
}

// Test 2: Charger et valider la configuration
console.log('\n2️⃣ Chargement de la configuration...');
let config;
try {
  config = require('./config');
  console.log('   ✅ Module config.js chargé');

  // Afficher le résumé de la config (sans exposer les secrets)
  const summary = config.summary();
  console.log('\n   📋 Configuration détectée:');
  console.log(`      • Telegram Bot Token: ${summary.telegram.botToken}`);
  console.log(`      • Telegram Chat ID: ${summary.telegram.authorizedChatId}`);
  console.log(`      • N8N URL: ${summary.n8n.apiUrl}`);
  console.log(`      • N8N API Key: ${summary.n8n.apiKey}`);
  console.log(`      • N8N Credential ID: ${summary.n8n.telegramCredentialId}`);
  console.log(`      • Master Workflow ID: ${summary.workflows.masterId}`);

  // Valider la configuration
  try {
    config.validate();
    results.config.status = '✅';
    results.config.message = 'Configuration valide';
    console.log('\n   ✅ Configuration valide');
  } catch (validationError) {
    results.config.status = '❌';
    results.config.message = validationError.message;
    console.log('\n   ❌ Configuration invalide:');
    console.log('   ' + validationError.message);
  }
} catch (error) {
  results.config.status = '❌';
  results.config.message = error.message;
  console.log('   ❌ Erreur lors du chargement:', error.message);
  console.log('   💡 Vérifiez que dotenv est installé: npm install dotenv');
}

// Si config invalide, arrêter ici
if (results.config.status === '❌' || results.envFile.status === '❌') {
  console.log('\n' + '='.repeat(50));
  console.log('\n❌ DIAGNOSTIC ÉCHOUÉ - Configuration manquante');
  console.log('\n🔧 Actions à faire:');
  console.log('   1. Créer le fichier .env: cp .env.template .env');
  console.log('   2. Éditer .env et remplir vos credentials');
  console.log('   3. Relancer: node health-check.js');
  process.exit(1);
}

// Test 3: Tester la connexion à N8N
console.log('\n3️⃣ Test de connexion à N8N...');
const n8nOptions = {
  hostname: config.n8n.apiUrl.replace('https://', ''),
  port: 443,
  path: '/api/v1/workflows',
  method: 'GET',
  headers: {
    'X-N8N-API-KEY': config.n8n.apiKey
  },
  timeout: 10000
};

const testN8N = new Promise((resolve) => {
  const req = https.request(n8nOptions, (res) => {
    let body = '';
    res.on('data', (chunk) => { body += chunk; });
    res.on('end', () => {
      if (res.statusCode === 200) {
        try {
          const data = JSON.parse(body);
          results.n8nConnection.status = '✅';
          results.n8nConnection.message = `Connecté (${data.data?.length || 0} workflows)`;
          console.log(`   ✅ Connexion N8N réussie`);
          console.log(`   📊 ${data.data?.length || 0} workflow(s) trouvé(s)`);
          resolve(true);
        } catch (e) {
          results.n8nConnection.status = '⚠️';
          results.n8nConnection.message = 'Connecté mais réponse invalide';
          console.log('   ⚠️ Connecté mais réponse invalide');
          resolve(false);
        }
      } else if (res.statusCode === 401) {
        results.n8nConnection.status = '❌';
        results.n8nConnection.message = 'API Key invalide ou expirée';
        console.log('   ❌ Authentification échouée (401)');
        console.log('   💡 Votre N8N_API_KEY est invalide ou expirée');
        console.log('   💡 Générez une nouvelle clé dans N8N > Settings > API');
        resolve(false);
      } else {
        results.n8nConnection.status = '❌';
        results.n8nConnection.message = `Erreur HTTP ${res.statusCode}`;
        console.log(`   ❌ Erreur HTTP ${res.statusCode}`);
        console.log(`   Response: ${body.substring(0, 200)}`);
        resolve(false);
      }
    });
  });

  req.on('error', (error) => {
    results.n8nConnection.status = '❌';
    results.n8nConnection.message = error.message;
    console.log('   ❌ Erreur de connexion:', error.message);
    console.log('   💡 Vérifiez que N8N_API_URL est correct:', config.n8n.apiUrl);
    resolve(false);
  });

  req.on('timeout', () => {
    results.n8nConnection.status = '❌';
    results.n8nConnection.message = 'Timeout (10s)';
    console.log('   ❌ Timeout après 10 secondes');
    console.log('   💡 Vérifiez votre connexion internet et l\'URL N8N');
    req.destroy();
    resolve(false);
  });

  req.end();
});

// Test 4: Vérifier le workflow Master
async function testMasterWorkflow() {
  console.log('\n4️⃣ Vérification du workflow Master...');

  const workflowOptions = {
    hostname: config.n8n.apiUrl.replace('https://', ''),
    port: 443,
    path: `/api/v1/workflows/${config.workflows.masterId}`,
    method: 'GET',
    headers: {
      'X-N8N-API-KEY': config.n8n.apiKey
    },
    timeout: 10000
  };

  return new Promise((resolve) => {
    const req = https.request(workflowOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const workflow = JSON.parse(body);
            results.workflow.status = '✅';
            results.workflow.message = `Workflow "${workflow.name}" trouvé`;
            console.log(`   ✅ Workflow Master trouvé`);
            console.log(`   📝 Nom: ${workflow.name}`);
            console.log(`   🔗 URL: ${config.n8n.apiUrl}/workflow/${workflow.id}`);
            console.log(`   🔄 Actif: ${workflow.active ? 'Oui' : 'Non'}`);
            resolve(true);
          } catch (e) {
            results.workflow.status = '⚠️';
            results.workflow.message = 'Réponse invalide';
            console.log('   ⚠️ Réponse invalide');
            resolve(false);
          }
        } else if (res.statusCode === 404) {
          results.workflow.status = '❌';
          results.workflow.message = 'Workflow Master introuvable';
          console.log('   ❌ Workflow Master introuvable');
          console.log('   💡 MASTER_WORKFLOW_ID invalide ou workflow supprimé');
          resolve(false);
        } else {
          results.workflow.status = '❌';
          results.workflow.message = `Erreur HTTP ${res.statusCode}`;
          console.log(`   ❌ Erreur HTTP ${res.statusCode}`);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      results.workflow.status = '❌';
      results.workflow.message = error.message;
      console.log('   ❌ Erreur:', error.message);
      resolve(false);
    });

    req.on('timeout', () => {
      results.workflow.status = '❌';
      results.workflow.message = 'Timeout';
      console.log('   ❌ Timeout');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// Test 5: Tester le bot Telegram (optionnel)
async function testTelegramBot() {
  console.log('\n5️⃣ Test du bot Telegram...');

  const botOptions = {
    hostname: 'api.telegram.org',
    port: 443,
    path: `/bot${config.telegram.botToken}/getMe`,
    method: 'GET',
    timeout: 10000
  };

  return new Promise((resolve) => {
    const req = https.request(botOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const data = JSON.parse(body);
            if (data.ok) {
              results.telegramBot.status = '✅';
              results.telegramBot.message = `Bot @${data.result.username}`;
              console.log(`   ✅ Bot Telegram actif`);
              console.log(`   🤖 Username: @${data.result.username}`);
              console.log(`   📛 Nom: ${data.result.first_name}`);
              resolve(true);
            } else {
              results.telegramBot.status = '❌';
              results.telegramBot.message = 'Token invalide';
              console.log('   ❌ Token invalide');
              resolve(false);
            }
          } catch (e) {
            results.telegramBot.status = '⚠️';
            results.telegramBot.message = 'Réponse invalide';
            console.log('   ⚠️ Réponse invalide');
            resolve(false);
          }
        } else if (res.statusCode === 401) {
          results.telegramBot.status = '❌';
          results.telegramBot.message = 'Token expiré ou invalide';
          console.log('   ❌ Token Telegram invalide ou expiré');
          console.log('   💡 Générez un nouveau token avec @BotFather');
          resolve(false);
        } else {
          results.telegramBot.status = '❌';
          results.telegramBot.message = `Erreur HTTP ${res.statusCode}`;
          console.log(`   ❌ Erreur HTTP ${res.statusCode}`);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      results.telegramBot.status = '❌';
      results.telegramBot.message = error.message;
      console.log('   ❌ Erreur:', error.message);
      resolve(false);
    });

    req.on('timeout', () => {
      results.telegramBot.status = '❌';
      results.telegramBot.message = 'Timeout';
      console.log('   ❌ Timeout');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// Exécuter les tests
async function runDiagnostic() {
  await testN8N;

  if (results.n8nConnection.status === '✅') {
    await testMasterWorkflow();
  }

  await testTelegramBot();

  // Résumé final
  console.log('\n' + '='.repeat(50));
  console.log('\n📊 RÉSUMÉ DU DIAGNOSTIC\n');

  const allTests = [
    { name: 'Fichier .env', ...results.envFile },
    { name: 'Configuration', ...results.config },
    { name: 'Connexion N8N', ...results.n8nConnection },
    { name: 'Workflow Master', ...results.workflow },
    { name: 'Bot Telegram', ...results.telegramBot }
  ];

  allTests.forEach(test => {
    console.log(`${test.status} ${test.name}: ${test.message}`);
  });

  // Vérifier si tous les tests critiques ont réussi
  const criticalTests = allTests.filter(t => t.critical);
  const allCriticalPassed = criticalTests.every(t => t.status === '✅');
  const allPassed = allTests.every(t => t.status === '✅' || t.status === '⚠️');

  console.log('\n' + '='.repeat(50));

  if (allCriticalPassed && allPassed) {
    console.log('\n✅ SYSTÈME OPÉRATIONNEL');
    console.log('\n🎉 Tous les composants fonctionnent correctement !');
    console.log('💡 Vous pouvez utiliser vos scripts en toute sécurité.');
    process.exit(0);
  } else if (allCriticalPassed) {
    console.log('\n⚠️  SYSTÈME PARTIELLEMENT OPÉRATIONNEL');
    console.log('\n✅ Les composants critiques fonctionnent');
    console.log('⚠️  Certains composants optionnels ont des problèmes');
    console.log('💡 Système utilisable mais correction recommandée');
    process.exit(0);
  } else {
    console.log('\n❌ SYSTÈME NON OPÉRATIONNEL');
    console.log('\n🔧 Actions requises:');

    if (results.envFile.status === '❌') {
      console.log('\n   1. Créer le fichier .env:');
      console.log('      cp .env.template .env');
    }

    if (results.config.status === '❌') {
      console.log('\n   2. Remplir les variables dans .env:');
      console.log('      TELEGRAM_BOT_TOKEN=votre_token');
      console.log('      N8N_API_KEY=votre_api_key');
    }

    if (results.n8nConnection.status === '❌') {
      console.log('\n   3. Vérifier votre connexion N8N');
      console.log('      • URL correcte: ' + config.n8n.apiUrl);
      console.log('      • API Key valide');
    }

    if (results.telegramBot.status === '❌') {
      console.log('\n   4. Vérifier votre token Telegram');
      console.log('      • Token valide de @BotFather');
    }

    console.log('\n💡 Relancez après corrections: node health-check.js');
    process.exit(1);
  }
}

runDiagnostic().catch(error => {
  console.error('\n❌ Erreur fatale:', error);
  process.exit(1);
});
