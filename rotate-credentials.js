/**
 * Script de rotation sécurisée des credentials
 * Usage: node rotate-credentials.js
 */

const https = require('https');
const fs = require('fs');
const readline = require('readline');
const { exec } = require('child_process');

// Couleurs pour terminal (compatible Windows)
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// État du processus
let newTelegramToken = '';
let newN8nApiKey = '';
const envPath = '.env';
const envBackupPath = '.env.backup';

// Configuration existante (lue depuis .env si existe)
const existingConfig = {
  N8N_API_URL: 'https://n8n.srv1289936.hstgr.cloud',
  AUTHORIZED_CHAT_ID: '673173233',
  N8N_TELEGRAM_CRED_ID: 'FSYQgwtSukrusz8V',
  MASTER_WORKFLOW_ID: 'dMksAyCROpecNL7A'
};

// Charger config existante si .env existe
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const lines = envContent.split('\n');
  lines.forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match && match[1] && match[2]) {
      const key = match[1].trim();
      const value = match[2].trim();
      if (value && !value.startsWith('your_')) {
        existingConfig[key] = value;
      }
    }
  });
}

console.log('\n' + colors.cyan + '🔐 ROTATION DES CREDENTIALS FRANKITO-IA' + colors.reset);
console.log(colors.cyan + '=' .repeat(50) + colors.reset + '\n');

/**
 * Fonction pour masquer l'input (affiche des étoiles)
 */
function askHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    let input = '';

    process.stdin.on('data', (char) => {
      char = char.toString();

      switch (char) {
        case '\n':
        case '\r':
        case '\u0004': // Ctrl-D
          process.stdin.pause();
          break;
        case '\u0003': // Ctrl-C
          process.exit();
          break;
        default:
          input += char;
          process.stdout.clearLine();
          process.stdout.cursorTo(0);
          process.stdout.write(question + '*'.repeat(input.length));
          break;
      }
    });

    rl.question(question, () => {
      rl.close();
      console.log(''); // Nouvelle ligne
      resolve(input.trim());
    });

    rl.on('close', () => {
      resolve(input.trim());
    });
  });
}

/**
 * Fonction pour poser une question normale
 */
function ask(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/**
 * Test de validité du token Telegram
 */
function testTelegramToken(token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${token}/getMe`,
      method: 'GET',
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          if (data.ok && data.result) {
            resolve({
              valid: true,
              username: data.result.username,
              firstName: data.result.first_name,
              id: data.result.id
            });
          } else {
            reject(new Error('Token invalide - Bot non reconnu'));
          }
        } catch (e) {
          reject(new Error('Réponse invalide de Telegram API'));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Erreur de connexion: ${error.message}`));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout - Vérifiez votre connexion'));
    });

    req.end();
  });
}

/**
 * Test de validité de la clé N8N
 */
function testN8nApiKey(apiKey) {
  return new Promise((resolve, reject) => {
    const url = existingConfig.N8N_API_URL || 'https://n8n.srv1289936.hstgr.cloud';
    const hostname = url.replace('https://', '');

    const options = {
      hostname: hostname,
      port: 443,
      path: '/api/v1/workflows',
      method: 'GET',
      headers: {
        'X-N8N-API-KEY': apiKey
      },
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const data = JSON.parse(body);
            resolve({
              valid: true,
              workflowCount: data.data?.length || 0
            });
          } catch (e) {
            reject(new Error('Réponse N8N invalide'));
          }
        } else if (res.statusCode === 401) {
          reject(new Error('API Key invalide ou expirée'));
        } else {
          reject(new Error(`Erreur HTTP ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Erreur de connexion N8N: ${error.message}`));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout N8N - Vérifiez l\'URL'));
    });

    req.end();
  });
}

/**
 * Créer le contenu du fichier .env
 */
function createEnvContent(telegramToken, n8nApiKey) {
  return `# Frankito-IA Configuration
# Généré par rotate-credentials.js le ${new Date().toISOString()}

# ======================
# Telegram Configuration
# ======================
TELEGRAM_BOT_TOKEN=${telegramToken}
AUTHORIZED_CHAT_ID=${existingConfig.AUTHORIZED_CHAT_ID}

# ======================
# N8N Configuration
# ======================
N8N_API_URL=${existingConfig.N8N_API_URL}
N8N_API_KEY=${n8nApiKey}
N8N_TELEGRAM_CRED_ID=${existingConfig.N8N_TELEGRAM_CRED_ID}

# ======================
# Workflow IDs
# ======================
MASTER_WORKFLOW_ID=${existingConfig.MASTER_WORKFLOW_ID}
`;
}

/**
 * Sauvegarder .env
 */
function saveEnv(content) {
  // Backup de l'ancien .env
  if (fs.existsSync(envPath)) {
    fs.copyFileSync(envPath, envBackupPath);
    console.log(colors.green + '   ✅ Backup créé : .env.backup' + colors.reset);
  }

  // Écrire le nouveau .env
  fs.writeFileSync(envPath, content, 'utf-8');
  console.log(colors.green + '   ✅ .env mis à jour' + colors.reset);
}

/**
 * Lancer le health check
 */
function runHealthCheck() {
  return new Promise((resolve, reject) => {
    exec('node health-check.js', (error, stdout, stderr) => {
      if (error) {
        // Même en cas d'erreur, on affiche la sortie
        console.log(stdout);
        console.error(stderr);
        reject(error);
      } else {
        console.log(stdout);
        resolve(stdout);
      }
    });
  });
}

/**
 * Processus principal
 */
async function main() {
  try {
    // ÉTAPE 1 : Token Telegram
    console.log(colors.blue + '📋 Étape 1/4 : Nouveau token Telegram Bot' + colors.reset);
    console.log(colors.yellow + '💡 Ouvrez @BotFather sur Telegram et créez un nouveau token' + colors.reset);
    console.log(colors.yellow + '   /mybots > [Votre bot] > API Token > Revoke & Regenerate' + colors.reset);
    console.log('');

    const telegramToken = await askHidden(colors.cyan + '🔑 Entrez votre nouveau token : ' + colors.reset);

    if (!telegramToken || telegramToken.length < 40) {
      console.log(colors.red + '   ❌ Token invalide (trop court)' + colors.reset);
      process.exit(1);
    }

    console.log(colors.yellow + '   ⏳ Test de validité...' + colors.reset);

    try {
      const botInfo = await testTelegramToken(telegramToken);
      console.log(colors.green + `   ✅ Bot validé : @${botInfo.username} (ID: ${botInfo.id})` + colors.reset);
      newTelegramToken = telegramToken;
    } catch (error) {
      console.log(colors.red + `   ❌ ${error.message}` + colors.reset);
      console.log(colors.yellow + '   💡 Vérifiez que vous avez copié le token complet' + colors.reset);
      process.exit(1);
    }

    console.log('');

    // ÉTAPE 2 : API Key N8N
    console.log(colors.blue + '📋 Étape 2/4 : Nouvelle API Key N8N' + colors.reset);
    console.log(colors.yellow + `💡 Connectez-vous sur ${existingConfig.N8N_API_URL}` + colors.reset);
    console.log(colors.yellow + '   Settings > API > Create API Key' + colors.reset);
    console.log('');

    const n8nApiKey = await askHidden(colors.cyan + '🔑 Entrez votre nouvelle clé : ' + colors.reset);

    if (!n8nApiKey || n8nApiKey.length < 50) {
      console.log(colors.red + '   ❌ API Key invalide (trop courte)' + colors.reset);
      process.exit(1);
    }

    console.log(colors.yellow + '   ⏳ Test de connexion N8N...' + colors.reset);

    try {
      const n8nInfo = await testN8nApiKey(n8nApiKey);
      console.log(colors.green + `   ✅ Connexion réussie (${n8nInfo.workflowCount} workflows actifs)` + colors.reset);
      newN8nApiKey = n8nApiKey;
    } catch (error) {
      console.log(colors.red + `   ❌ ${error.message}` + colors.reset);
      console.log(colors.yellow + '   💡 Vérifiez que vous avez copié la clé complète' + colors.reset);
      console.log(colors.yellow + '   💡 Vérifiez que la clé a bien été créée dans N8N' + colors.reset);
      process.exit(1);
    }

    console.log('');

    // ÉTAPE 3 : Sauvegarde et mise à jour
    console.log(colors.blue + '📋 Étape 3/4 : Sauvegarde et mise à jour .env' + colors.reset);

    const envContent = createEnvContent(newTelegramToken, newN8nApiKey);
    saveEnv(envContent);

    console.log('');

    // ÉTAPE 4 : Validation finale
    console.log(colors.blue + '📋 Étape 4/4 : Validation finale' + colors.reset);
    console.log(colors.yellow + '   ⏳ Lancement du health-check...' + colors.reset);
    console.log('');

    try {
      await runHealthCheck();
    } catch (error) {
      console.log(colors.red + '\n❌ Le health-check a détecté des problèmes' + colors.reset);
      console.log(colors.yellow + '💡 Vérifiez les erreurs ci-dessus' + colors.reset);
      console.log(colors.yellow + `💡 Votre ancien .env a été sauvegardé dans ${envBackupPath}` + colors.reset);
      process.exit(1);
    }

    // SUCCÈS !
    console.log('\n' + colors.green + '=' .repeat(50) + colors.reset);
    console.log(colors.green + '🎉 ROTATION TERMINÉE AVEC SUCCÈS !' + colors.reset);
    console.log(colors.green + '=' .repeat(50) + colors.reset);

    console.log('\n' + colors.cyan + '🧹 Commandes de nettoyage final :' + colors.reset);
    console.log(colors.yellow + '\n   # Supprimer le dossier archive (contient anciennes credentials)' + colors.reset);
    console.log(colors.white + '   rm -rf archive/' + colors.reset);
    console.log(colors.yellow + '\n   # Vérifier l\'état Git' + colors.reset);
    console.log(colors.white + '   git status' + colors.reset);
    console.log(colors.yellow + '\n   # Ajouter les fichiers sécurisés' + colors.reset);
    console.log(colors.white + '   git add .env.template .gitignore config.js health-check.js rotate-credentials.js' + colors.reset);
    console.log(colors.yellow + '\n   # Commit de sécurisation' + colors.reset);
    console.log(colors.white + '   git commit -m "chore: secure credentials with centralized config and rotation tools"' + colors.reset);

    console.log('\n' + colors.cyan + '📝 Notes importantes :' + colors.reset);
    console.log(colors.yellow + '   • Anciennes credentials sauvegardées dans : ' + colors.reset + envBackupPath);
    console.log(colors.yellow + '   • Vérifiez que .env est bien dans .gitignore (déjà fait ✅)' + colors.reset);
    console.log(colors.yellow + '   • Ne commitez JAMAIS le fichier .env' + colors.reset);
    console.log(colors.yellow + '   • Vous pouvez supprimer .env.backup après vérification' + colors.reset);

    console.log('\n' + colors.green + '✅ Votre système est maintenant sécurisé !' + colors.reset + '\n');

  } catch (error) {
    console.error(colors.red + '\n❌ Erreur fatale : ' + error.message + colors.reset);
    process.exit(1);
  }
}

// Lancer le processus
main();
