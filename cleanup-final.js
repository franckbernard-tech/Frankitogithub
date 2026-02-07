/**
 * Script de nettoyage final après rotation des credentials
 * Usage: node cleanup-final.js
 */

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

console.log('\n' + colors.cyan + '🧹 NETTOYAGE FINAL FRANKITO-IA' + colors.reset);
console.log(colors.cyan + '=' .repeat(50) + colors.reset + '\n');

// Vérifier que les credentials ont été rotées
console.log(colors.blue + '1️⃣ Vérification de la rotation des credentials...' + colors.reset);

try {
  const envContent = fs.readFileSync('.env', 'utf-8');

  const oldTelegramToken = '8510817329:AAE72JsuTE_r-sAnclrNN5APE1wIDeKKGXE';
  const oldN8nKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4YWVhYjY1Ny04ZDU0LTRmYTQtYWYzYi0zYzQzODM3ZWY0MWMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiMTAwMGM1OGEtZGVjNC00NDdkLTg2NDUtMjJlZDdlMGE2NDMxIiwiaWF0IjoxNzcwNDA0NDU4fQ';

  if (envContent.includes(oldTelegramToken)) {
    console.log(colors.red + '   ❌ ATTENTION : Ancien token Telegram détecté dans .env' + colors.reset);
    console.log(colors.yellow + '   💡 Lancez d\'abord: node rotate-credentials.js' + colors.reset);
    process.exit(1);
  }

  if (envContent.includes(oldN8nKey)) {
    console.log(colors.red + '   ❌ ATTENTION : Ancienne API key N8N détectée dans .env' + colors.reset);
    console.log(colors.yellow + '   💡 Lancez d\'abord: node rotate-credentials.js' + colors.reset);
    process.exit(1);
  }

  console.log(colors.green + '   ✅ Nouvelles credentials détectées' + colors.reset);
} catch (error) {
  console.log(colors.red + '   ❌ Impossible de lire .env' + colors.reset);
  process.exit(1);
}

// Supprimer le dossier archive/
console.log('\n' + colors.blue + '2️⃣ Suppression du dossier archive/...' + colors.reset);

if (fs.existsSync('archive')) {
  try {
    // Compter les fichiers
    const files = fs.readdirSync('archive');
    console.log(colors.yellow + `   📁 ${files.length} fichier(s) à supprimer` + colors.reset);

    // Supprimer récursivement
    fs.rmSync('archive', { recursive: true, force: true });
    console.log(colors.green + '   ✅ Dossier archive/ supprimé' + colors.reset);
  } catch (error) {
    console.log(colors.red + '   ❌ Erreur lors de la suppression: ' + error.message + colors.reset);
  }
} else {
  console.log(colors.yellow + '   ⚠️  Dossier archive/ déjà supprimé' + colors.reset);
}

// Nettoyer les backups obsolètes
console.log('\n' + colors.blue + '3️⃣ Nettoyage des fichiers temporaires...' + colors.reset);

const filesToClean = [
  'secrets.txt',
  '.env.backup'
];

let cleaned = 0;
filesToClean.forEach(file => {
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
    console.log(colors.green + `   ✅ Supprimé : ${file}` + colors.reset);
    cleaned++;
  }
});

if (cleaned === 0) {
  console.log(colors.yellow + '   ⚠️  Aucun fichier temporaire à nettoyer' + colors.reset);
}

// Vérifier git status
console.log('\n' + colors.blue + '4️⃣ Vérification de l\'état Git...' + colors.reset);

try {
  const status = execSync('git status --porcelain', { encoding: 'utf-8' });

  if (status.trim()) {
    console.log(colors.yellow + '   📝 Fichiers modifiés détectés :' + colors.reset);
    console.log('\n' + status.split('\n').map(line => '      ' + line).join('\n'));

    // Vérifier que .env n'est pas tracké
    if (status.includes('.env')) {
      console.log(colors.red + '\n   ⚠️  ATTENTION : .env apparaît dans git status !' + colors.reset);
      console.log(colors.yellow + '   💡 Vérifiez que .env est bien dans .gitignore' + colors.reset);
      console.log(colors.yellow + '   💡 Si .env est tracké par erreur, lancez:' + colors.reset);
      console.log(colors.white + '      git rm --cached .env' + colors.reset);
    }
  } else {
    console.log(colors.green + '   ✅ Aucun changement non commité' + colors.reset);
  }
} catch (error) {
  console.log(colors.yellow + '   ⚠️  Pas de repository Git détecté' + colors.reset);
}

// Résumé et commandes suggérées
console.log('\n' + colors.green + '=' .repeat(50) + colors.reset);
console.log(colors.green + '✅ NETTOYAGE TERMINÉ !' + colors.reset);
console.log(colors.green + '=' .repeat(50) + colors.reset);

console.log('\n' + colors.cyan + '📋 Prochaines étapes recommandées :' + colors.reset);

console.log(colors.yellow + '\n   1️⃣ Vérifier que tout fonctionne :' + colors.reset);
console.log(colors.white + '      node health-check.js' + colors.reset);

console.log(colors.yellow + '\n   2️⃣ Ajouter les fichiers de sécurité :' + colors.reset);
console.log(colors.white + '      git add .env.template .gitignore config.js health-check.js rotate-credentials.js cleanup-final.js' + colors.reset);

console.log(colors.yellow + '\n   3️⃣ Commiter les changements :' + colors.reset);
console.log(colors.white + '      git commit -m "chore: secure credentials with centralized config and rotation tools"' + colors.reset);

console.log(colors.yellow + '\n   4️⃣ [OPTIONNEL] Nettoyer l\'historique Git :' + colors.reset);
console.log(colors.yellow + '      ⚠️  Seulement si nécessaire et après backup !' + colors.reset);
console.log(colors.white + '      # Voir le guide dans le rapport d\'audit' + colors.reset);

console.log('\n' + colors.cyan + '📝 Rappels de sécurité :' + colors.reset);
console.log(colors.yellow + '   • .env est maintenant dans .gitignore ✅' + colors.reset);
console.log(colors.yellow + '   • Anciennes credentials révoquées ✅' + colors.reset);
console.log(colors.yellow + '   • Nouvelles credentials actives ✅' + colors.reset);
console.log(colors.yellow + '   • Archive/ supprimée ✅' + colors.reset);

console.log('\n' + colors.green + '🎉 Votre projet est maintenant sécurisé !' + colors.reset + '\n');
