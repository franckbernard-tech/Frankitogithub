#!/usr/bin/env node
/**
 * Simple ding/beep - Fait sonner le terminal
 * Usage: node ding.js
 */

const { execSync } = require('child_process');

try {
  execSync('powershell -Command "[console]::beep(800,500)"', { stdio: 'ignore' });
} catch (e) {
  process.stdout.write('\x07');
}
