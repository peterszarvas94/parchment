#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync } from 'fs';

function run(command, silent = false, interactive = false) {
  try {
    const options = { encoding: 'utf-8' };
    if (interactive) {
      options.stdio = 'inherit';
    }
    const output = execSync(command, options);
    if (!silent && !interactive) console.log(output);
    return interactive ? '' : output.trim();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

function getVersion() {
  const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));
  return pkg.version;
}

console.log('🚀 Nanotext Release Script\n');

// Get version type from args
const versionType = process.argv[2] || 'patch';
if (!['patch', 'minor', 'major'].includes(versionType)) {
  console.error('Usage: npm run release [patch|minor|major]');
  process.exit(1);
}

console.log(`📦 Bumping ${versionType} version...`);
const newVersion = run(`npm version ${versionType}`, true);
console.log(`✓ Version bumped to ${newVersion}\n`);

console.log('🔨 Building...');
run('npm run build');
console.log('✓ Build complete\n');

console.log('📤 Pushing to GitHub...');
run('git push');
run('git push --tags');
console.log('✓ Pushed to GitHub\n');

console.log('⏳ Waiting for GitHub to sync...');
run('sleep 2', true);

console.log('🔍 Verifying version on GitHub...');
const remoteVersion = run(`git ls-remote --tags origin ${newVersion}`, true);
if (remoteVersion.includes(newVersion)) {
  console.log(`✓ Tag ${newVersion} confirmed on GitHub\n`);
} else {
  console.error(`✗ Tag ${newVersion} not found on GitHub`);
  process.exit(1);
}

console.log('📝 Creating GitHub release...');
const releaseNotes = `Release ${newVersion}`;
run(`gh release create ${newVersion} --title "${newVersion}" --notes "${releaseNotes}"`);
console.log(`✓ GitHub release created: https://github.com/peterszarvas94/nanotext/releases/tag/${newVersion}\n`);

console.log('📦 Publishing to npm...');
console.log('⚠️  You will need to enter your 2FA code when prompted.\n');
run('npm publish', false, true);
console.log('\n✓ Published to npm\n');

console.log('🎉 Release complete!');
console.log(`\nView on npm: https://www.npmjs.com/package/nanotext`);
console.log(`View on GitHub: https://github.com/peterszarvas94/nanotext/releases/tag/${newVersion}`);
