#!/usr/bin/env node
/**
 * Auto-Fix Script - Frankito-IA
 * Applique automatiquement les corrections sûres détectées par l'audit
 *
 * Usage: node auto-fix.js [--dry-run] [--all] [--critical-only]
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
const dryRun = process.argv.includes('--dry-run');
const fixAll = process.argv.includes('--all');
const criticalOnly = process.argv.includes('--critical-only');

// Résultats
const results = {
  fixed: [],
  skipped: [],
  errors: [],
  warnings: []
};

// Utility functions
function log(message, color = 'white') {
  console.log(colors[color] + message + colors.reset);
}

function success(message) {
  results.fixed.push(message);
  log('✅ ' + message, 'green');
}

function skip(message) {
  results.skipped.push(message);
  log('⏭️  ' + message, 'yellow');
}

function error(message) {
  results.errors.push(message);
  log('❌ ' + message, 'red');
}

function warning(message) {
  results.warnings.push(message);
  log('⚠️  ' + message, 'yellow');
}

function info(message) {
  log('ℹ️  ' + message, 'cyan');
}

/**
 * Backup avant modifications
 */
function createBackup() {
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const backupDir = `backup-${timestamp}`;

  if (!dryRun) {
    try {
      fs.mkdirSync(backupDir, { recursive: true });

      // Copier fichiers critiques
      const criticalFiles = ['.env', 'package.json', '.gitignore'];
      criticalFiles.forEach(file => {
        if (fs.existsSync(file)) {
          fs.copyFileSync(file, path.join(backupDir, file));
        }
      });

      success(`Backup créé dans ${backupDir}/`);
      return backupDir;
    } catch (e) {
      error(`Échec backup: ${e.message}`);
      return null;
    }
  } else {
    info(`[DRY-RUN] Backup serait créé dans ${backupDir}/`);
    return backupDir;
  }
}

/**
 * FIX 1 (CRITIQUE): Supprimer create_workflow.py
 */
function fix_DeletePythonWithCredentials() {
  log('\n' + colors.blue + '🔧 Fix 1: Supprimer create_workflow.py (credentials hardcodées)' + colors.reset);

  const file = 'create_workflow.py';

  if (!fs.existsSync(file)) {
    skip(`${file} déjà supprimé`);
    return;
  }

  if (dryRun) {
    info(`[DRY-RUN] Supprimerait ${file}`);
    return;
  }

  try {
    fs.unlinkSync(file);
    success(`${file} supprimé`);
  } catch (e) {
    error(`Échec suppression ${file}: ${e.message}`);
  }
}

/**
 * FIX 2 (CRITIQUE): Supprimer .env.backup
 */
function fix_DeleteEnvBackup() {
  log('\n' + colors.blue + '🔧 Fix 2: Supprimer .env.backup (anciennes credentials)' + colors.reset);

  const file = '.env.backup';

  if (!fs.existsSync(file)) {
    skip(`${file} déjà supprimé`);
    return;
  }

  if (dryRun) {
    info(`[DRY-RUN] Supprimerait ${file}`);
    return;
  }

  try {
    fs.unlinkSync(file);
    success(`${file} supprimé`);
  } catch (e) {
    error(`Échec suppression ${file}: ${e.message}`);
  }
}

/**
 * FIX 3 (CRITIQUE): Supprimer scripts dupliqués
 */
function fix_DeleteDuplicateScripts() {
  log('\n' + colors.blue + '🔧 Fix 3: Supprimer scripts fix-workflow dupliqués' + colors.reset);

  const duplicates = [
    'fix-workflow.js',
    'fix-workflow-v2.js',
    'fix-workflow-v3.js'
  ];

  duplicates.forEach(file => {
    if (!fs.existsSync(file)) {
      skip(`${file} déjà supprimé`);
      return;
    }

    if (dryRun) {
      info(`[DRY-RUN] Supprimerait ${file}`);
      return;
    }

    try {
      fs.unlinkSync(file);
      success(`${file} supprimé (version archivée conservée)`);
    } catch (e) {
      error(`Échec suppression ${file}: ${e.message}`);
    }
  });
}

/**
 * FIX 4 (IMPORTANT): Ajouter dotenv à package.json
 */
function fix_AddDotenvDependency() {
  log('\n' + colors.blue + '🔧 Fix 4: Ajouter dotenv à package.json' + colors.reset);

  if (criticalOnly) {
    skip('Fix non-critique ignoré (--critical-only)');
    return;
  }

  if (!fs.existsSync('package.json')) {
    error('package.json manquant!');
    return;
  }

  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

  if (pkg.dependencies && pkg.dependencies.dotenv) {
    skip('dotenv déjà dans package.json');
    return;
  }

  if (dryRun) {
    info('[DRY-RUN] Ajouterait "dotenv": "^16.0.0" aux dependencies');
    return;
  }

  try {
    pkg.dependencies = pkg.dependencies || {};
    pkg.dependencies.dotenv = '^16.0.0';

    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
    success('dotenv ajouté à package.json');

    info('Exécutez: npm install');
  } catch (e) {
    error(`Échec mise à jour package.json: ${e.message}`);
  }
}

/**
 * FIX 5 (IMPORTANT): Créer .editorconfig
 */
function fix_CreateEditorConfig() {
  log('\n' + colors.blue + '🔧 Fix 5: Créer .editorconfig' + colors.reset);

  if (criticalOnly) {
    skip('Fix non-critique ignoré (--critical-only)');
    return;
  }

  if (fs.existsSync('.editorconfig')) {
    skip('.editorconfig déjà existant');
    return;
  }

  const editorConfig = `# EditorConfig - Frankito-IA
# https://editorconfig.org

root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

[*.{js,json}]
indent_style = space
indent_size = 2

[*.md]
trim_trailing_whitespace = false

[*.py]
indent_style = space
indent_size = 4

[Makefile]
indent_style = tab
`;

  if (dryRun) {
    info('[DRY-RUN] Créerait .editorconfig');
    return;
  }

  try {
    fs.writeFileSync('.editorconfig', editorConfig, 'utf-8');
    success('.editorconfig créé');
  } catch (e) {
    error(`Échec création .editorconfig: ${e.message}`);
  }
}

/**
 * FIX 6 (IMPORTANT): Créer .nvmrc
 */
function fix_CreateNvmrc() {
  log('\n' + colors.blue + '🔧 Fix 6: Créer .nvmrc' + colors.reset);

  if (criticalOnly) {
    skip('Fix non-critique ignoré (--critical-only)');
    return;
  }

  if (fs.existsSync('.nvmrc')) {
    skip('.nvmrc déjà existant');
    return;
  }

  const nvmrc = '20\n';

  if (dryRun) {
    info('[DRY-RUN] Créerait .nvmrc avec Node 20');
    return;
  }

  try {
    fs.writeFileSync('.nvmrc', nvmrc, 'utf-8');
    success('.nvmrc créé (Node.js 20)');
  } catch (e) {
    error(`Échec création .nvmrc: ${e.message}`);
  }
}

/**
 * FIX 7 (IMPORTANT): Créer .gitattributes
 */
function fix_CreateGitAttributes() {
  log('\n' + colors.blue + '🔧 Fix 7: Créer .gitattributes' + colors.reset);

  if (criticalOnly) {
    skip('Fix non-critique ignoré (--critical-only)');
    return;
  }

  if (fs.existsSync('.gitattributes')) {
    skip('.gitattributes déjà existant');
    return;
  }

  const gitattributes = `# Auto detect text files and perform LF normalization
* text=auto

# Explicitly declare text files
*.js text eol=lf
*.json text eol=lf
*.md text eol=lf
*.sh text eol=lf
*.py text eol=lf

# Denote all files that are truly binary
*.png binary
*.jpg binary
*.gif binary
*.ico binary
*.pdf binary
`;

  if (dryRun) {
    info('[DRY-RUN] Créerait .gitattributes');
    return;
  }

  try {
    fs.writeFileSync('.gitattributes', gitattributes, 'utf-8');
    success('.gitattributes créé');
  } catch (e) {
    error(`Échec création .gitattributes: ${e.message}`);
  }
}

/**
 * FIX 8 (IMPORTANT): Créer structure de dossiers
 */
function fix_CreateDirectoryStructure() {
  log('\n' + colors.blue + '🔧 Fix 8: Créer structure de dossiers' + colors.reset);

  if (criticalOnly) {
    skip('Fix non-critique ignoré (--critical-only)');
    return;
  }

  const dirs = [
    'src/bot',
    'src/utils',
    'scripts/rotation',
    'scripts/deployment',
    'scripts/health',
    'scripts/tests',
    'workflows/production',
    'workflows/templates',
    'executions',
    'docs/guides',
    'docs/architecture',
    'docs/audit'
  ];

  dirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      skip(`${dir}/ déjà existant`);
      return;
    }

    if (dryRun) {
      info(`[DRY-RUN] Créerait ${dir}/`);
      return;
    }

    try {
      fs.mkdirSync(dir, { recursive: true });
      success(`${dir}/ créé`);
    } catch (e) {
      error(`Échec création ${dir}/: ${e.message}`);
    }
  });
}

/**
 * FIX 9 (IMPORTANT): Ajouter shebangs aux scripts
 */
function fix_AddShebangs() {
  log('\n' + colors.blue + '🔧 Fix 9: Ajouter shebangs aux scripts' + colors.reset);

  if (criticalOnly) {
    skip('Fix non-critique ignoré (--critical-only)');
    return;
  }

  const scripts = [
    'health-check.js',
    'auto-rotate.js',
    'rotate-credentials.js',
    'cleanup-final.js',
    'portability-check.js',
    'auto-fix.js'
  ];

  scripts.forEach(script => {
    if (!fs.existsSync(script)) {
      skip(`${script} n'existe pas`);
      return;
    }

    const content = fs.readFileSync(script, 'utf-8');
    const lines = content.split('\n');

    if (lines[0].startsWith('#!/usr/bin/env node')) {
      skip(`${script} a déjà un shebang`);
      return;
    }

    if (dryRun) {
      info(`[DRY-RUN] Ajouterait shebang à ${script}`);
      return;
    }

    try {
      const newContent = '#!/usr/bin/env node\n' + content;
      fs.writeFileSync(script, newContent, 'utf-8');
      success(`Shebang ajouté à ${script}`);
    } catch (e) {
      error(`Échec ajout shebang ${script}: ${e.message}`);
    }
  });
}

/**
 * FIX 10 (OPTIONNEL): Déplacer execution_*.json
 */
function fix_MoveExecutionFiles() {
  log('\n' + colors.blue + '🔧 Fix 10: Déplacer execution_*.json vers executions/' + colors.reset);

  if (criticalOnly || !fixAll) {
    skip('Fix optionnel ignoré (utiliser --all)');
    return;
  }

  const files = fs.readdirSync('.').filter(f => f.match(/^execution_\d+\.json$/));

  if (files.length === 0) {
    skip('Aucun fichier execution_*.json à déplacer');
    return;
  }

  if (dryRun) {
    info(`[DRY-RUN] Déplacerait ${files.length} fichiers vers executions/`);
    files.slice(0, 5).forEach(f => info(`  - ${f}`));
    if (files.length > 5) info(`  ... et ${files.length - 5} autres`);
    return;
  }

  // Créer dossier si besoin
  if (!fs.existsSync('executions')) {
    fs.mkdirSync('executions', { recursive: true });
  }

  let moved = 0;
  files.forEach(file => {
    try {
      fs.renameSync(file, path.join('executions', file));
      moved++;
    } catch (e) {
      error(`Échec déplacement ${file}: ${e.message}`);
    }
  });

  success(`${moved} fichiers déplacés vers executions/`);
}

/**
 * Générer rapport final
 */
function generateReport() {
  log('\n' + colors.cyan + '=' .repeat(50) + colors.reset);
  log(colors.cyan + '📊 RAPPORT AUTO-FIX' + colors.reset);
  log(colors.cyan + '=' .repeat(50) + colors.reset + '\n');

  log(`✅ Fixes appliqués:  ${results.fixed.length}`, 'green');
  log(`⏭️  Fixes ignorés:    ${results.skipped.length}`, 'yellow');
  log(`❌ Erreurs:          ${results.errors.length}`, 'red');

  if (results.fixed.length > 0) {
    log('\n' + colors.green + '✅ CORRECTIONS APPLIQUÉES:' + colors.reset);
    results.fixed.forEach(f => log('  • ' + f, 'green'));
  }

  if (results.errors.length > 0) {
    log('\n' + colors.red + '❌ ERREURS:' + colors.reset);
    results.errors.forEach(e => log('  • ' + e, 'red'));
  }

  if (dryRun) {
    log('\n' + colors.cyan + '💡 MODE DRY-RUN: Aucune modification effectuée' + colors.reset);
    log(colors.cyan + '   Relancez sans --dry-run pour appliquer les corrections' + colors.reset);
  }

  log('');

  // Prochaines étapes
  if (!dryRun && results.fixed.length > 0) {
    log(colors.cyan + '📋 PROCHAINES ÉTAPES:' + colors.reset);

    if (results.fixed.some(f => f.includes('package.json'))) {
      log('   1. npm install', 'white');
    }

    log('   2. node portability-check.js', 'white');
    log('   3. node health-check.js', 'white');
    log('   4. git status', 'white');
    log('   5. git add -A && git commit -m "chore: auto-fix audit issues"', 'white');
    log('');
  }

  // Exit code
  if (results.errors.length > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

/**
 * Main
 */
function main() {
  log('\n' + colors.cyan + '🔧 AUTO-FIX - Frankito-IA' + colors.reset);
  log(colors.cyan + '=' .repeat(50) + colors.reset);

  // Mode
  if (dryRun) {
    log(colors.yellow + '⚙️  MODE DRY-RUN - Aucune modification ne sera effectuée' + colors.reset);
  } else {
    log(colors.green + '⚙️  MODE RÉEL - Modifications SERONT appliquées' + colors.reset);
  }

  if (criticalOnly) {
    log(colors.yellow + '🔴 MODE CRITICAL ONLY - Seulement les fixes critiques' + colors.reset);
  } else if (fixAll) {
    log(colors.yellow + '🌟 MODE ALL - Tous les fixes, y compris optionnels' + colors.reset);
  }

  log('');

  // Créer backup
  const backupDir = createBackup();

  // Exécuter tous les fixes
  log('\n' + colors.cyan + '🔴 FIXES CRITIQUES' + colors.reset);
  fix_DeletePythonWithCredentials();
  fix_DeleteEnvBackup();
  fix_DeleteDuplicateScripts();

  if (!criticalOnly) {
    log('\n' + colors.cyan + '🟡 FIXES IMPORTANTS' + colors.reset);
    fix_AddDotenvDependency();
    fix_CreateEditorConfig();
    fix_CreateNvmrc();
    fix_CreateGitAttributes();
    fix_CreateDirectoryStructure();
    fix_AddShebangs();
  }

  if (fixAll) {
    log('\n' + colors.cyan + '🟢 FIXES OPTIONNELS' + colors.reset);
    fix_MoveExecutionFiles();
  }

  // Générer rapport
  generateReport();
}

// Lancer
main();
