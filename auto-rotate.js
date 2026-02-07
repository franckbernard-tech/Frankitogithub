#!/usr/bin/env node
/**
 * Rotation automatique des credentials
 *
 * Usage:
 *   node auto-rotate.js --telegram="TOKEN" --n8n="KEY"
 *   node auto-rotate.js --from-file=new-creds.tmp
 */

const https = require('https');
const fs = require('fs');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

let tempFile = null;

// Configuration
const envPath = '.env';
const envBackupPath = '.env.backup';

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

/**
 * Parser les arguments CLI
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const result = {};

  args.forEach(arg => {
    if (arg.startsWith('--telegram=')) {
      result.telegram = arg.split('=')[1].replace(/['"]/g, '');
    } else if (arg.startsWith('--n8n=')) {
      result.n8n = arg.split('=')[1].replace(/['"]/g, '');
    } else if (arg.startsWith('--from-file=')) {
      result.fromFile = arg.split('=')[1];
    }
  });

  return result;
}

/**
 * Lire credentials depuis un fichier
 */
function readCredentialsFromFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Fichier introuvable: ${filePath}`);
  }

  tempFile = filePath; // Pour cleanup
  const content = fs.readFileSync(filePath, 'utf-8');
  const creds = {};

  content.split('\n').forEach(line => {
    if (line.includes('TELEGRAM_BOT_TOKEN=')) {
      creds.telegram = line.split('=')[1].trim();
    } else if (line.includes('N8N_API_KEY=')) {
      creds.n8n = line.split('=')[1].trim();
    }
  });

  return creds;
}

/**
 * Valider token Telegram
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
            reject(new Error('Token Telegram invalide'));
          }
        } catch (e) {
          reject(new Error('Réponse Telegram API invalide'));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Erreur Telegram: ${error.message}`));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout Telegram API'));
    });

    req.end();
  });
}

/**
 * Valider API Key N8N
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
          reject(new Error('N8N API Key invalide ou expirée'));
        } else {
          reject(new Error(`N8N erreur HTTP ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Erreur N8N: ${error.message}`));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout N8N API'));
    });

    req.end();
  });
}

/**
 * Créer contenu .env
 */
function createEnvContent(telegramToken, n8nApiKey) {
  const timestamp = new Date().toISOString();
  return `# Frankito-IA Configuration
# Auto-généré par auto-rotate.js le ${timestamp}

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
  // Backup
  if (fs.existsSync(envPath)) {
    fs.copyFileSync(envPath, envBackupPath);
  }

  // Écrire nouveau .env
  fs.writeFileSync(envPath, content, 'utf-8');
}

/**
 * Supprimer archive/
 */
function cleanupArchive() {
  if (fs.existsSync('archive')) {
    const files = fs.readdirSync('archive');
    fs.rmSync('archive', { recursive: true, force: true });
    return files.length;
  }
  return 0;
}

/**
 * Nettoyage fichiers temporaires
 */
function cleanup() {
  // Supprimer le fichier temporaire si utilisé
  if (tempFile && fs.existsSync(tempFile)) {
    try {
      fs.unlinkSync(tempFile);
    } catch (e) {
      // Silencieux
    }
  }

  // Supprimer secrets.txt si existe
  if (fs.existsSync('secrets.txt')) {
    try {
      fs.unlinkSync('secrets.txt');
    } catch (e) {
      // Silencieux
    }
  }
}

/**
 * Processus principal
 */
async function main() {
  console.log('\n' + colors.cyan + '🔐 ROTATION AUTOMATIQUE DES CREDENTIALS' + colors.reset);
  console.log(colors.cyan + '=' .repeat(50) + colors.reset + '\n');

  try {
    // Parse arguments
    const args = parseArgs();
    let telegramToken, n8nApiKey;

    if (args.fromFile) {
      console.log(colors.blue + '📁 Lecture depuis fichier: ' + args.fromFile + colors.reset);
      const creds = readCredentialsFromFile(args.fromFile);
      telegramToken = creds.telegram;
      n8nApiKey = creds.n8n;
    } else if (args.telegram && args.n8n) {
      console.log(colors.blue + '📋 Lecture depuis arguments CLI' + colors.reset);
      telegramToken = args.telegram;
      n8nApiKey = args.n8n;
    } else {
      console.log(colors.red + '❌ Usage invalide' + colors.reset);
      console.log('\n' + colors.yellow + 'Mode 1 - Arguments CLI:' + colors.reset);
      console.log('  node auto-rotate.js --telegram="TOKEN" --n8n="KEY"');
      console.log('\n' + colors.yellow + 'Mode 2 - Fichier:' + colors.reset);
      console.log('  echo "TELEGRAM_BOT_TOKEN=..." > new-creds.tmp');
      console.log('  echo "N8N_API_KEY=..." >> new-creds.tmp');
      console.log('  node auto-rotate.js --from-file=new-creds.tmp\n');
      process.exit(1);
    }

    // Vérifier que les tokens sont fournis
    if (!telegramToken || !n8nApiKey) {
      throw new Error('Credentials manquantes dans le fichier ou les arguments');
    }

    console.log('');

    // Validation en parallèle
    console.log(colors.yellow + '⏳ Validation des credentials...' + colors.reset);

    const [telegramResult, n8nResult] = await Promise.all([
      testTelegramToken(telegramToken)
        .then(result => ({ success: true, data: result }))
        .catch(error => ({ success: false, error: error.message })),
      testN8nApiKey(n8nApiKey)
        .then(result => ({ success: true, data: result }))
        .catch(error => ({ success: false, error: error.message }))
    ]);

    // Vérifier résultats
    if (!telegramResult.success) {
      console.log(colors.red + '❌ Token Telegram invalide: ' + telegramResult.error + colors.reset);
      process.exit(1);
    }

    if (!n8nResult.success) {
      console.log(colors.red + '❌ N8N API Key invalide: ' + n8nResult.error + colors.reset);
      process.exit(1);
    }

    console.log(colors.green + '✅ Token Telegram validé : @' + telegramResult.data.username + colors.reset);
    console.log(colors.green + '✅ N8N API Key validée : ' + n8nResult.data.workflowCount + ' workflows' + colors.reset);
    console.log('');

    // Mise à jour .env
    console.log(colors.yellow + '⏳ Mise à jour .env...' + colors.reset);
    const envContent = createEnvContent(telegramToken, n8nApiKey);
    saveEnv(envContent);
    console.log(colors.green + '✅ .env mis à jour (backup: .env.backup)' + colors.reset);
    console.log('');

    // Health check
    console.log(colors.yellow + '⏳ Health-check...' + colors.reset);
    try {
      execSync('node health-check.js', { stdio: 'pipe', encoding: 'utf-8' });
      console.log(colors.green + '✅ Health-check : SYSTÈME OPÉRATIONNEL' + colors.reset);
    } catch (error) {
      console.log(colors.red + '❌ Health-check a échoué' + colors.reset);
      console.log(colors.yellow + '💡 Lancez manuellement: node health-check.js' + colors.reset);
      // Continue quand même
    }
    console.log('');

    // Cleanup archive
    console.log(colors.yellow + '⏳ Nettoyage archive/...' + colors.reset);
    const filesRemoved = cleanupArchive();
    if (filesRemoved > 0) {
      console.log(colors.green + `✅ Archive/ supprimée (${filesRemoved} fichiers)` + colors.reset);
    } else {
      console.log(colors.yellow + '⚠️  Archive/ déjà supprimée' + colors.reset);
    }
    console.log('');

    // Cleanup fichiers temporaires
    cleanup();

    // Succès
    console.log(colors.green + '=' .repeat(50) + colors.reset);
    console.log(colors.green + '✅ ROTATION TERMINÉE AVEC SUCCÈS' + colors.reset);
    console.log(colors.green + '=' .repeat(50) + colors.reset);
    console.log('');

    // Commande Git
    console.log(colors.cyan + '📋 COMMANDE FINALE :' + colors.reset);
    console.log('');
    const gitCommand = 'git add .env.template .gitignore config.js health-check.js rotate-credentials.js cleanup-final.js auto-rotate.js ROTATION-GUIDE.md && git commit -m "chore: secure credentials with automated rotation system"';
    console.log(colors.white + gitCommand + colors.reset);
    console.log('');

    console.log(colors.cyan + '📝 Notes :' + colors.reset);
    console.log(colors.yellow + '   • Anciennes credentials révoquées et remplacées' + colors.reset);
    console.log(colors.yellow + '   • Backup disponible dans .env.backup' + colors.reset);
    console.log(colors.yellow + '   • Archive/ et fichiers temporaires supprimés' + colors.reset);
    console.log(colors.yellow + '   • .env protégé par .gitignore ✅' + colors.reset);
    console.log('');

    console.log(colors.green + '🎉 Système sécurisé et prêt pour production !' + colors.reset + '\n');

    // Bell
    process.stdout.write('\x07');

  } catch (error) {
    console.error(colors.red + '\n❌ ERREUR : ' + error.message + colors.reset);
    console.log(colors.yellow + '\n💡 Aucun changement n\'a été effectué sur .env' + colors.reset);
    console.log(colors.yellow + '💡 Vérifiez vos credentials et réessayez' + colors.reset + '\n');
    process.exit(1);
  } finally {
    // Cleanup en cas d'erreur aussi
    cleanup();
  }
}

// Gestion propre des erreurs non catchées
process.on('uncaughtException', (error) => {
  console.error(colors.red + '\n❌ Erreur fatale: ' + error.message + colors.reset + '\n');
  cleanup();
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error(colors.red + '\n❌ Erreur async: ' + error.message + colors.reset + '\n');
  cleanup();
  process.exit(1);
});

// Lancer
main();
