# Publishing Guide

This guide covers publishing `@imsus/pi-extension-minimax-coding-plan-mcp` to npm and GitHub Packages.

## Publishing to npm (Public Registry)

### Prerequisites

- npm account: https://www.npmjs.com/signup
- Personal access token or login credentials

### Authentication

```bash
# Login to npm (if not already)
npm login

# Or use token in ~/.npmrc
echo "//registry.npmjs.org/:_authToken=YOUR_TOKEN" >> ~/.npmrc
```

### Publish to npm

```bash
# Publish as public package
npm publish

# View package
https://www.npmjs.com/package/@imsus/pi-extension-minimax-coding-plan-mcp
```

### Install from npm

```bash
# For pi users
pi install npm:@imsus/pi-extension-minimax-coding-plan-mcp

# For Node.js projects
npm install @imsus/pi-extension-minimax-coding-plan-mcp
```

## Publishing to GitHub Packages

### Prerequisites

- GitHub personal access token (classic) with `write:packages` scope
- Repository: https://github.com/imsus/pi-extension-minimax-coding-plan-mcp

### Authentication

```bash
# Add to ~/.npmrc
echo "//npm.pkg.github.com/:_authToken=YOUR_TOKEN" >> ~/.npmrc

# Or login via command line
npm login --scope=@imsus --registry=https://npm.pkg.github.com
```

### Publish to GitHub Packages

```bash
npm publish --registry=https://npm.pkg.github.com

# View package
https://github.com/imsus/pi-extension-minimax-coding-plan-mcp/pkgs/npm/pi-extension-minimax-coding-plan-mcp
```

## Configuration

**package.json:**
```json
{
  "name": "@imsus/pi-extension-minimax-coding-plan-mcp",
  "publishConfig": {
    "access": "public",
    "registry": "https://npm.pkg.github.com"
  }
}
```

## Publishing New Versions

```bash
# Update version
npm version patch  # or minor, major

# Publish to npm
npm publish

# Or publish to GitHub Packages
npm publish --registry=https://npm.pkg.github.com
```

## Troubleshooting

### Authentication Issues

```bash
# Check if logged in
npm whoami

# Re-login
npm login
```

### 401/403 Errors

- Verify your token has correct scopes
- Check token hasn't expired
- Ensure `.npmrc` is configured correctly

### Package Name Conflicts

- Package name: `@imsus/pi-extension-minimax-coding-plan-mcp`
- Must be unique on the registry

## See Also

- [npm Publishing Documentation](https://docs.npmjs.com/cli/publish)
- [GitHub Packages npm Documentation](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry)
