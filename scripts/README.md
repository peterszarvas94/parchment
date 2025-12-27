# Release Scripts

## Usage

### Quick Release (patch version)

```bash
npm run release
```

This will:
1. Bump patch version (0.1.2 → 0.1.3)
2. Build the project
3. Push to GitHub with tags
4. Create GitHub release
5. Publish to npm (requires 2FA code)

### Specific Version Types

```bash
npm run release:patch  # 0.1.2 → 0.1.3
npm run release:minor  # 0.1.2 → 0.2.0
npm run release:major  # 0.1.2 → 1.0.0
```

## What It Does

The release script automates the entire release process:

1. **Version Bump** - Uses `npm version` to bump version in package.json
2. **Build** - Runs `npm run build` to create dist files
3. **Push to GitHub** - Pushes code and tags to GitHub
4. **Verify** - Checks that the tag exists on GitHub
5. **Create Release** - Creates a GitHub release using `gh` CLI
6. **Publish to npm** - Publishes to npm (you'll need to enter 2FA code)

## Requirements

- **GitHub CLI** (`gh`) must be installed and authenticated
- **2FA** enabled on npm account
- Authenticator app ready for npm 2FA code

## Example

```bash
$ npm run release:minor

🚀 Nanotext Release Script

📦 Bumping minor version...
✓ Version bumped to v0.2.0

🔨 Building...
✓ Build complete

📤 Pushing to GitHub...
✓ Pushed to GitHub

🔍 Verifying version on GitHub...
✓ Tag v0.2.0 confirmed on GitHub

📝 Creating GitHub release...
✓ GitHub release created

📦 Publishing to npm...
⚠️  You will need to enter your 2FA code when prompted.

npm notice Publishing to https://registry.npmjs.org/
This operation requires a one-time password.
Enter OTP: 123456

✓ Published to npm

🎉 Release complete!

View on npm: https://www.npmjs.com/package/nanotext
View on GitHub: https://github.com/peterszarvas94/nanotext/releases/tag/v0.2.0
```
