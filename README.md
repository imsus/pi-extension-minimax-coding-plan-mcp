# pi-minimax-mcp

![npm version](https://img.shields.io/npm/v/pi-minimax-mcp)
![npm downloads](https://img.shields.io/npm/dm/pi-minimax-mcp)
![License](https://img.shields.io/npm/l/pi-minimax-mcp)

MiniMax MCP (Model Context Protocol) extension for [pi coding agent](https://github.com/badlogic/pi-mono) - provides **web_search** and **understand_image** tools.

## Features

- 🔍 **Web Search** - Search the web for information and get results with suggestions
- 🖼 **Image Understanding** - Analyze images with AI, extract text, describe content
- ⚡ **Easy Configuration** - Configure via command or environment variables
- 🔄 **Hot Reload** - Changes apply without restarting pi
- 🎨 **Rich UI** - Custom rendering with progress indicators and status updates

## Prerequisites

- [pi coding agent](https://github.com/badlogic/pi-mono) installed
- [MiniMax Coding Plan subscription](https://platform.minimax.io/subscribe/coding-plan)
- Node.js >= 18.0.0

## Installation

### Option 1: npm (Recommended)

```bash
# Install the package
npm install pi-minimax-mcp
```

Add to your pi settings (`~/.pi/settings.json`):

```json
{
  "packages": ["npm:pi-minimax-mcp@latest"]
}
```

### Option 2: Git

```bash
# Clone the repository
git clone https://github.com/imsus/pi-minimax-mcp.git
cd pi-minimax-mcp
npm install
```

Add to your pi settings (`~/.pi/settings.json`):

```json
{
  "packages": ["git:https://github.com/imsus/pi-minimax-mcp.git"]
}
```

### Option 3: Local Development

Clone and link locally:

```bash
git clone https://github.com/imsus/pi-minimax-mcp.git
cd pi-minimax-mcp
npm install
npm link

# Add to pi settings
echo '["$(pwd)"]' > ~/.pi-extensions-path
# Or add directly to ~/.pi/settings.json:
# { "packages": ["/path/to/pi-minimax-mcp"] }
```

## Configuration

### Get Your API Key

1. Visit [MiniMax Coding Plan subscription page](https://platform.minimax.io/subscribe/coding-plan)
2. Subscribe to a plan
3. Copy your API key from the dashboard

### Configuration Priority

The extension checks for the API key in this order:

1. **Environment variable** (recommended for per-session config)
   ```bash
   export MINIMAX_API_KEY="your-api-key-here"
   export MINIMAX_API_HOST="https://api.minimax.io"  # optional, default
   ```

2. **Project settings** (`.pi/settings.json`) - overrides global
   ```json
   {
     "minimax": {
       "key": "your-api-key-here"
     }
   }
   ```

3. **Global settings** (`~/.pi/agent/settings.json`)
   ```json
   {
     "minimax": {
       "key": "your-api-key-here"
     }
   }
   ```

> **Note:** Project settings take precedence over global settings.

### In-Session Configuration (Temporary)

You can also set the API key temporarily during a session:

```bash
pi
/minimax-configure --key your-api-key-here
```

This stores the key in memory only and will be lost when pi exits. For permanent storage, use environment variables or settings files.

### Configuration Options

```bash
# Show help
/minimax-configure --help

# Show current status
/minimax-configure --show

# Set API key directly
/minimax-configure --key your-api-key-here

# Clear configuration
/minimax-configure --clear
```

### Check Status

```bash
/minimax-status
```

Shows current configuration status and available tools.

## Usage

### Web Search

Search for information:

```
Search the web for TypeScript best practices 2024

web_search({
  query: "How to configure pi coding agent extensions"
})
```

Returns search results with titles, URLs, snippets, and suggestions.

### Image Understanding

Analyze images with AI:

```
Understand this screenshot: https://example.com/screenshot.png
"What's in this image?"

web_search({
  query: "React server components tutorial"
})
```

#### Image Formats

- Supported: JPEG, PNG, GIF, WebP
- Maximum size: 20MB
- Sources: HTTP/HTTPS URLs or local file paths

#### Example Prompts

```typescript
// Describe image content
understand_image({
  prompt: "Describe what's in this image",
  image_url: "https://example.com/photo.jpg"
})

// Extract text (OCR)
understand_image({
  prompt: "Extract all text from this image",
  image_url: "./screenshots/document.png"
})

// Analyze UI/UX
understand_image({
  prompt: "Analyze this UI design and suggest improvements",
  image_url: "https://example.com/mockup.png"
})

// Code understanding
understand_image({
  prompt: "What code is shown in this screenshot?",
  image_url: "./error-screenshot.jpg"
})
```

## Tools Reference

### web_search

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| query | string | ✓ | Search query (2-500 characters) |

**Example:**
```typescript
web_search({
  query: "Pi coding agent extensions guide"
})
```

**Returns:** List of search results with titles, URLs, snippets, and suggestions.

### understand_image

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| prompt | string | ✓ | Question or analysis request (1-1000 characters) |
| image_url | string | ✓ | Image URL or local path |

**Example:**
```typescript
understand_image({
  prompt: "What is in this image?",
  image_url: "https://example.com/screenshot.png"
})
```

**Returns:** AI analysis of the image content.

## Extension Commands

| Command | Description |
|---------|-------------|
| `/minimax-configure` | Configure API key |
| `/minimax-status` | Show configuration status |
| `/reload` | Hot reload extension (built-in) |

## Development

### Project Structure

```
pi-minimax-mcp/
├── src/
│   └── index.ts          # Main extension code
├── dist/                  # Compiled JavaScript (after build)
├── package.json           # npm package config
├── tsconfig.json          # TypeScript config
└── README.md             # This file
```

### Build

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Watch mode for development
npm run dev
```

### Testing

```bash
# Build first
npm run build

# Test locally
pi
# Extension auto-loads from dist/index.js
```

### Publishing

```bash
# Login to npm
npm login

# Publish
npm publish

# Publish with tag
npm publish --tag beta
```

## Troubleshooting

### API Key Not Working

1. Verify your API key at https://platform.minimax.io/subscribe/coding-plan
2. Check key hasn't expired
3. Ensure you have the Coding Plan subscription (not just MiniMax account)

### Extension Not Loading

1. Check pi logs for errors
2. Verify package is in `~/.pi/settings.json`
3. Ensure npm install completed successfully
4. Try restarting pi

### Tool Returns Error

1. Check `/minimax-status` for configuration
2. Verify network connectivity
3. Check API key has required permissions

### Local File Paths Not Working

Use absolute paths or paths relative to current directory:
```typescript
understand_image({
  prompt: "Analyze this file",
  image_url: "/Users/username/screenshots/error.png"
  // or
  image_url: "./screenshots/error.png"
})
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- 📖 [Documentation](https://github.com/imsus/pi-minimax-mcp#readme)
- 🐛 [Issues](https://github.com/imsus/pi-minimax-mcp/issues)
- 💬 [Discussions](https://github.com/imsus/pi-minimax-mcp/discussions)

## Changelog

### v1.0.0 (2024-01-29)

- ✨ Initial release
- 🔍 web_search tool
- 🖼 understand_image tool
- ⚙️ Configuration commands
- 🎨 Rich UI with custom rendering
- 🔄 Hot reload support
