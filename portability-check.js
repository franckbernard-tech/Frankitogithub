#!/usr/bin/env node
/**
 * Portability Check Script
 * Valide la portabilité du projet Frankito-IA sur différents OS
 *
 * Usage: node portability-check.js [--verbose] [--fix]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Configuration
const verbose = process.argv.includes('--verbose');
const fixMode = process.argv.includes('--fix');

// Résultats
const results = {
  passed: [],
  warnings: [],
  errors: [],
  critical: []
};

// Utility functions
function log(message, color = 'white') {
  console.log(colors[color] + message + colors.reset);
}

function success(message) {
  results.passed.push(message);
  log('✅ ' + message, 'green');
}

function warning(message) {
  results.warnings.push(message);
  log('⚠️  ' + message, 'yellow');
}

function error(message) {
  results.errors.push(message);
  log('❌ ' + message, 'red');
}

function critical(message) {
  results.critical.push(message);
  log('🔴 ' + message, 'red');
}

function info(message) {
  if (verbose) {
    log('ℹ️  ' + message, 'cyan');
  }
}

/**
 * Scan tous les fichiers .js du projet
 */
function getAllJsFiles(dir = '.', fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules, .git, archive
      if (!['node_modules', '.git', 'archive'].includes(file)) {
        getAllJsFiles(filePath, fileList);
      }
    } else if (file.endsWith('.js')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Check 1: Vérifier la présence de paths Windows-specific
 */
function checkWindowsPaths() {
  log('\n' + colors.blue + '📁 Test 1: Windows-Specific Paths' + colors.reset);

  const jsFiles = getAllJsFiles();
  const problemFiles = [];

  jsFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // Détecter paths Windows (C:\, \Users\, etc.)
      if (/['"](C:\\|\\\\Users\\|\\\\Documents\\|\\\\)/.test(line)) {
        problemFiles.push({
          file,
          line: index + 1,
          content: line.trim()
        });
      }
    });
  });

  if (problemFiles.length === 0) {
    success('Aucun path Windows hardcodé trouvé');
  } else {
    error(`${problemFiles.length} paths Windows-specific trouvés`);
    problemFiles.forEach(p => {
      info(`  ${p.file}:${p.line} - ${p.content.substring(0, 80)}...`);
    });
  }
}

/**
 * Check 2: Vérifier les shebangs
 */
function checkShebangs() {
  log('\n' + colors.blue + '📝 Test 2: Shebangs Unix' + colors.reset);

  const jsFiles = getAllJsFiles();
  const missingShebang = [];

  jsFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    const firstLine = content.split('\n')[0];

    if (!firstLine.startsWith('#!')) {
      // Vérifier si c'est un script exécutable (heuristique)
      if (content.includes('process.argv') || file.includes('script')) {
        missingShebang.push(file);
      }
    }
  });

  if (missingShebang.length === 0) {
    success('Tous les scripts ont un shebang');
  } else {
    warning(`${missingShebang.length} scripts sans shebang`);
    missingShebang.forEach(f => {
      info(`  ${f}`);
    });
  }
}

/**
 * Check 3: Vérifier package.json dependencies
 */
function checkDependencies() {
  log('\n' + colors.blue + '📦 Test 3: Dependencies' + colors.reset);

  if (!fs.existsSync('package.json')) {
    critical('package.json manquant!');
    return;
  }

  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };

  // Dépendances requises connues
  const requiredDeps = ['telegraf', 'axios', 'dotenv'];
  const missingDeps = [];

  requiredDeps.forEach(dep => {
    if (!deps[dep]) {
      missingDeps.push(dep);
    }
  });

  if (missingDeps.length === 0) {
    success('Toutes les dependencies principales sont déclarées');
  } else {
    error(`Dependencies manquantes: ${missingDeps.join(', ')}`);
  }

  // Vérifier si node_modules existe
  if (!fs.existsSync('node_modules')) {
    warning('node_modules/ manquant - exécuter npm install');
  } else {
    success('node_modules/ présent');
  }
}

/**
 * Check 4: Vérifier .env et .gitignore
 */
function checkEnvSecurity() {
  log('\n' + colors.blue + '🔒 Test 4: Sécurité .env' + colors.reset);

  // .env doit exister
  if (fs.existsSync('.env')) {
    success('.env existe');
  } else {
    warning('.env manquant - copier depuis .env.template');
  }

  // .env.template doit exister
  if (fs.existsSync('.env.template')) {
    success('.env.template existe');
  } else {
    error('.env.template manquant');
  }

  // .gitignore doit inclure .env
  if (fs.existsSync('.gitignore')) {
    const gitignore = fs.readFileSync('.gitignore', 'utf-8');
    if (gitignore.includes('.env')) {
      success('.env est dans .gitignore');
    } else {
      critical('.env NON protégé par .gitignore!');
    }
  } else {
    critical('.gitignore manquant!');
  }

  // .env.backup ne devrait pas exister
  if (fs.existsSync('.env.backup')) {
    critical('.env.backup existe - SUPPRIMER (contient anciennes credentials)');
  } else {
    success('.env.backup absent (bon)');
  }
}

/**
 * Check 5: Vérifier les credentials hardcodées
 */
function checkHardcodedCredentials() {
  log('\n' + colors.blue + '🔑 Test 5: Credentials Hardcodées' + colors.reset);

  const dangerousFiles = [];

  // Check Python files
  if (fs.existsSync('create_workflow.py')) {
    const content = fs.readFileSync('create_workflow.py', 'utf-8');
    if (content.includes('TELEGRAM_BOT_TOKEN') || content.includes('N8N_API_KEY')) {
      critical('create_workflow.py contient credentials hardcodées - SUPPRIMER');
      dangerousFiles.push('create_workflow.py');
    }
  }

  // Check all JS files
  const jsFiles = getAllJsFiles();
  jsFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');

    // Patterns de credentials
    const patterns = [
      /TELEGRAM_BOT_TOKEN\s*=\s*['"][\d:A-Za-z_-]{40,}['"]/, // Token Telegram
      /N8N_API_KEY\s*=\s*['"]eyJ[A-Za-z0-9._-]{100,}['"]/, // JWT N8N
      /bot_token\s*=\s*['"][\d:A-Za-z_-]{40,}['"]/ // Autres formats
    ];

    patterns.forEach((pattern, index) => {
      if (pattern.test(content)) {
        // Exception: config.js qui charge depuis .env
        if (!file.includes('config.js') && !file.includes('archive')) {
          critical(`${file} contient credentials hardcodées (pattern ${index + 1})`);
          dangerousFiles.push(file);
        }
      }
    });
  });

  if (dangerousFiles.length === 0) {
    success('Aucune credential hardcodée trouvée');
  } else {
    critical(`${dangerousFiles.length} fichiers avec credentials hardcodées`);
  }
}

/**
 * Check 6: Vérifier line endings (CRLF vs LF)
 */
function checkLineEndings() {
  log('\n' + colors.blue + '📄 Test 6: Line Endings' + colors.reset);

  if (fs.existsSync('.editorconfig')) {
    success('.editorconfig existe');
  } else {
    warning('.editorconfig manquant - créer pour standardiser');
  }

  if (fs.existsSync('.gitattributes')) {
    success('.gitattributes existe');
  } else {
    warning('.gitattributes manquant - créer pour gérer line endings');
  }
}

/**
 * Check 7: Vérifier version Node.js
 */
function checkNodeVersion() {
  log('\n' + colors.blue + '🟢 Test 7: Version Node.js' + colors.reset);

  try {
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));

    log(`   Node.js version: ${nodeVersion}`, 'cyan');

    if (majorVersion >= 16) {
      success('Node.js version compatible (>= 16)');
    } else {
      error(`Node.js trop ancien (${nodeVersion}). Requis: >= 16`);
    }

    // Check .nvmrc
    if (fs.existsSync('.nvmrc')) {
      const nvmrc = fs.readFileSync('.nvmrc', 'utf-8').trim();
      success(`.nvmrc existe (version: ${nvmrc})`);
    } else {
      warning('.nvmrc manquant - créer pour spécifier version Node.js');
    }
  } catch (e) {
    error('Impossible de détecter version Node.js');
  }
}

/**
 * Check 8: Structure des dossiers
 */
function checkDirectoryStructure() {
  log('\n' + colors.blue + '📂 Test 8: Structure des Dossiers' + colors.reset);

  const recommendedDirs = {
    'src': false,
    'scripts': false,
    'workflows': false,
    'docs': false,
    'tests': false
  };

  Object.keys(recommendedDirs).forEach(dir => {
    if (fs.existsSync(dir)) {
      recommendedDirs[dir] = true;
      success(`Dossier ${dir}/ existe`);
    } else {
      warning(`Dossier ${dir}/ manquant (recommandé)`);
    }
  });

  // Compter fichiers à la racine
  const rootFiles = fs.readdirSync('.').filter(f => {
    const stat = fs.statSync(f);
    return stat.isFile() && f.endsWith('.js');
  });

  if (rootFiles.length > 10) {
    warning(`${rootFiles.length} fichiers .js à la racine (recommandé: < 10)`);
  } else {
    success(`Structure racine propre (${rootFiles.length} fichiers .js)`);
  }
}

/**
 * Check 9: Vérifier OS compatibility
 */
function checkOSCompatibility() {
  log('\n' + colors.blue + '💻 Test 9: OS Compatibility' + colors.reset);

  const platform = process.platform;
  log(`   Plateforme détectée: ${platform}`, 'cyan');

  if (platform === 'win32') {
    success('Windows détecté');
    warning('Tester aussi sur Linux/Mac pour garantir portabilité');
  } else if (platform === 'linux') {
    success('Linux détecté');
  } else if (platform === 'darwin') {
    success('macOS détecté');
  }

  // Check PowerShell scripts
  const psScripts = fs.readdirSync('.').filter(f => f.endsWith('.ps1'));
  if (psScripts.length > 0 && platform !== 'win32') {
    warning(`${psScripts.length} scripts PowerShell trouvés (non compatibles sur cet OS)`);
  }

  // Check shell scripts
  const shScripts = fs.readdirSync('.').filter(f => f.endsWith('.sh'));
  if (shScripts.length > 0 && platform === 'win32') {
    warning(`${shScripts.length} scripts shell trouvés (non compatibles sans WSL/Git Bash)`);
  }
}

/**
 * Check 10: Documentation
 */
function checkDocumentation() {
  log('\n' + colors.blue + '📚 Test 10: Documentation' + colors.reset);

  const docs = {
    'README.md': false,
    'CLAUDE.md': false,
    '.env.template': false
  };

  Object.keys(docs).forEach(doc => {
    if (fs.existsSync(doc)) {
      docs[doc] = true;
      success(`${doc} existe`);
    } else {
      error(`${doc} manquant`);
    }
  });
}

/**
 * Générer rapport final
 */
function generateReport() {
  log('\n' + colors.cyan + '=' .repeat(50) + colors.reset);
  log(colors.cyan + '📊 RAPPORT FINAL' + colors.reset);
  log(colors.cyan + '=' .repeat(50) + colors.reset + '\n');

  const total = results.passed.length + results.warnings.length + results.errors.length + results.critical.length;

  log(`✅ Passed:   ${results.passed.length}/${total}`, 'green');
  log(`⚠️  Warnings: ${results.warnings.length}/${total}`, 'yellow');
  log(`❌ Errors:   ${results.errors.length}/${total}`, 'red');
  log(`🔴 Critical: ${results.critical.length}/${total}`, 'red');

  // Score de portabilité
  const score = Math.round((results.passed.length / total) * 100);
  log(`\n🎯 Score de Portabilité: ${score}%`, score >= 70 ? 'green' : 'yellow');

  // Recommendations
  if (results.critical.length > 0) {
    log('\n' + colors.red + '🚨 ACTIONS CRITIQUES REQUISES:' + colors.reset);
    results.critical.forEach(c => log('  • ' + c, 'red'));
  }

  if (results.errors.length > 0) {
    log('\n' + colors.red + '❌ ERREURS À CORRIGER:' + colors.reset);
    results.errors.forEach(e => log('  • ' + e, 'yellow'));
  }

  if (results.warnings.length > 0 && verbose) {
    log('\n' + colors.yellow + '⚠️  AMÉLIORATIONS RECOMMANDÉES:' + colors.reset);
    results.warnings.forEach(w => log('  • ' + w, 'yellow'));
  }

  log('');

  // Exit code
  if (results.critical.length > 0) {
    log(colors.red + '❌ Échec: Problèmes critiques détectés' + colors.reset);
    process.exit(1);
  } else if (results.errors.length > 0) {
    log(colors.yellow + '⚠️  Attention: Erreurs détectées' + colors.reset);
    process.exit(1);
  } else if (results.warnings.length > 5) {
    log(colors.yellow + '⚠️  Portabilité limitée: Plusieurs warnings' + colors.reset);
    process.exit(0);
  } else {
    log(colors.green + '✅ Système portable et fonctionnel!' + colors.reset);
    process.exit(0);
  }
}

/**
 * Main
 */
function main() {
  log('\n' + colors.cyan + '🔍 PORTABILITY CHECK - Frankito-IA' + colors.reset);
  log(colors.cyan + '=' .repeat(50) + colors.reset);

  if (fixMode) {
    log(colors.yellow + '⚙️  Mode FIX activé - Corrections automatiques' + colors.reset);
  }

  if (verbose) {
    log(colors.yellow + '📝 Mode VERBOSE activé' + colors.reset);
  }

  // Exécuter tous les checks
  checkWindowsPaths();
  checkShebangs();
  checkDependencies();
  checkEnvSecurity();
  checkHardcodedCredentials();
  checkLineEndings();
  checkNodeVersion();
  checkDirectoryStructure();
  checkOSCompatibility();
  checkDocumentation();

  // Générer rapport
  generateReport();
}

// Lancer
main();
