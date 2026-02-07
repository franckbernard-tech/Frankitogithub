/**
 * Test de différentes méthodes pour faire sonner le terminal
 */

const { exec } = require('child_process');

console.log('🔔 Test de sonnerie du terminal...\n');

// Méthode 1 : Bell character (Unix/Linux)
console.log('1️⃣ Méthode 1 : Bell character (\\x07)');
process.stdout.write('\x07');
console.log('   (Si vous n\'entendez rien, passez à la méthode 2)\n');

setTimeout(() => {
  // Méthode 2 : PowerShell beep (Windows)
  console.log('2️⃣ Méthode 2 : PowerShell [console]::beep()');
  exec('powershell -Command "[console]::beep(800,500)"', (error) => {
    if (error) {
      console.log('   ❌ Échec PowerShell beep\n');
    } else {
      console.log('   ✅ PowerShell beep réussi\n');
    }

    setTimeout(() => {
      // Méthode 3 : Multiple bells
      console.log('3️⃣ Méthode 3 : Triple bell');
      process.stdout.write('\x07\x07\x07');
      console.log('   (3 bips rapides)\n');

      setTimeout(() => {
        // Méthode 4 : Windows Media Player (si disponible)
        console.log('4️⃣ Méthode 4 : Son système Windows');
        exec('powershell -Command "(New-Object Media.SoundPlayer \'C:\\Windows\\Media\\Windows Ding.wav\').PlaySync();"', (error) => {
          if (error) {
            console.log('   ❌ Son système non disponible\n');
          } else {
            console.log('   ✅ Son système joué\n');
          }

          console.log('🎵 Tests terminés !');
          console.log('\n💡 Quelle méthode a fonctionné pour vous ?');
        });
      }, 1000);
    }, 1000);
  });
}, 1000);
