#!/usr/bin/env node

import { execSync } from 'child_process';

console.log('📦 Publishing to npm...');
console.log('⚠️  Enter your 2FA code when prompted.\n');

try {
  execSync('npm publish', { stdio: 'inherit' });
  console.log('\n✓ Published to npm!\n');
  console.log('View at: https://www.npmjs.com/package/nanotext');
} catch (error) {
  console.error('\n✗ Publish failed');
  process.exit(1);
}
