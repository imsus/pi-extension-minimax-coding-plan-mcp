# @imsus/pi-extension-minimax-coding-plan-mcp

![npm version](https://img.shields.io/npm/v/@imsus/pi-extension-minimax-coding-plan-mcp)
![npm downloads](https://img.shields.io/npm/dm/@imsus/pi-extension-minimax-coding-plan-mcp)
![License](https://img.shields.io/npm/l/@imsus/pi-extension-minimax-coding-plan-mcp)

MiniMax MCP (Model Context Protocol) extension for [pi coding agent](https://github.com/badlogic/pi-mono) that provides AI-powered web search and image understanding capabilities.

Since pi doesn't natively support MCP, this extension bridges that gap by implementing the [MiniMax MCP API](https://platform.minimax.io/docs/coding-plan/mcp-guide) directly as pi tools.

## Features

- 🔍 **Web Search** - Search the web for current information with intelligent results and suggestions
- 🖼️ **Image Understanding** - Analyze images with AI for descriptions, OCR, code extraction, and visual analysis
- 📖 **Built-in Skills** - Guides the LLM on when and how to use each tool effectively
- ⚡ **Easy Configuration** - Configure via environment variables or pi settings files
- 🔄 **Hot Reload** - Changes apply without restarting pi
- 🎨 **Rich UI** - Custom rendering with progress indicators and status updates

## Prerequisites

- [pi coding agent](https://github.com/badlogic/pi-mono) installed
- [MiniMax Coding Plan subscription](https://platform.minimax.io/subscribe/coding-plan)
- Node.js >= 18.0.0

### Related Resources

- **PyPI Package**: [minimax-coding-plan-mcp](https://pypi.org/project/minimax-coding-plan-mcp/) - The official Python MCP server this implementation is based on
- **MiniMax Platform**: [api.minimax.io](https://api.minimax.io) - Global API endpoint
- **MiniMax Platform (China)**: [api.minimaxi.com](https://api.minimaxi.com) - Mainland China API endpoint

## Why This Extension?

The [MiniMax Coding Plan](https://platform.minimax.io/subscribe/coding-plan) provides powerful MCP tools for web search and image understanding. However, pi doesn't natively support MCP protocol.

This extension implements those same capabilities as native pi tools, so you get:
- The same MiniMax MCP functionality you love
- Full integration with pi's tool system
- Custom rendering and progress indicators
- Built-in skills to help the LLM use tools effectively

## About This Implementation

This extension was **reverse-engineered** from the official [MiniMax Coding Plan MCP](https://pypi.org/project/minimax-coding-plan-mcp/) Python package. The original package provides MCP protocol tools that work with MCP-compatible clients like Claude Desktop, Cursor, and Windsurf.

By analyzing the Python implementation, this extension recreates the same functionality directly as pi native tools, providing:
- Identical API endpoints and behavior
- Matching request/response formats
- Consistent error handling
- Seamless pi integration

## Installation

Use the `pi install` command to install packages from npm, git, or HTTPS URLs.

### Install from npm

```bash
pi install npm:@imsus/pi-extension-minimax-coding-plan-mcp
```

### Install from git

```bash
pi install git:https://github.com/imsus/pi-extension-minimax-coding-plan-mcp
```

Or with a version tag:

```bash
pi install git:https://github.com/imsus/pi-extension-minimax-coding-plan-mcp@v1.0.0
```

### Install from HTTPS URL

```bash
pi install https://github.com/imsus/pi-extension-minimax-coding-plan-mcp
```

### Project Installation

Add `-l` flag to install to project settings (`.pi/settings.json`):

```bash
pi install -l npm:@imsus/pi-extension-minimax-coding-plan-mcp
```

Project settings can be shared with your team, and pi will auto-install missing packages on startup.

### Try Without Installing

Use `--extension` or `-e` to try the package without installing:

```bash
pi -e npm:@imsus/pi-extension-minimax-coding-plan-mcp
pi -e git:https://github.com/imsus/pi-extension-minimax-coding-plan-mcp
```

### Manage Packages

```bash
pi list              # show installed packages
pi update            # update all non-pinned packages
pi remove npm:@imsus/pi-extension-minimax-coding-plan-mcp  # remove a package
```

## Configuration

### Get Your API Key

1. If you haven't subscribed yet, visit [MiniMax Coding Plan](https://platform.minimax.io/subscribe/coding-plan) to subscribe
2. Once subscribed, go to [API Key page](https://platform.minimax.io/user-center/payment/coding-plan) to get your API key

### Configuration Priority

The extension checks for the API key in this order:

1. **Environment variable** (recommended for per-session config)
   ```bash
   export MINIMAX_API_KEY="your-api-key-here"
   export MINIMAX_API_HOST="https://api.minimax.io"  # optional, default
   ```

2. **Auth file** (`~/.pi/agent/auth.json`) - persistent across sessions
   ```json
   {
     "minimax": {
       "type": "api_key",
       "key": "your-api-key-here"
     }
   }
   ```

> **Note:** Use `/minimax-configure` command to set up your API key interactively.

### In-Session Configuration

Set or update your API key:

```bash
pi
/minimax-configure --key your-api-key-here
```

This saves to `~/.pi/agent/auth.json` for permanent storage.

### Configuration Commands

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

Search for current information:

```
Search the web for TypeScript best practices 2026

web_search({
  query: "latest React 19 features announcement"
})
```

Returns search results with titles, URLs, snippets, and suggestions.

**When to use:**
- Current events and news
- Latest releases and updates
- Fact verification with recent information
- Technical documentation that may have changed

### Image Understanding

Analyze images with AI:

```
Understand this screenshot

understand_image({
  prompt: "What error is shown in this screenshot?",
  image_url: "https://example.com/error.png"
})
```

#### Image Formats

- Supported: JPEG, PNG, GIF, WebP
- Maximum size: 20MB
- Sources: HTTP/HTTPS URLs or local file paths

#### Example Use Cases

```typescript
// Describe image content
understand_image({
  prompt: "Describe what's in this image in detail",
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

// Code from screenshot
understand_image({
  prompt: "What code is shown in this screenshot? Transcribe it exactly.",
  image_url: "./error-screenshot.jpg"
})

// Debug errors
understand_image({
  prompt: "What is the error message and stack trace in this screenshot?",
  image_url: "./bug-screenshot.png"
})
```

**When to use:**
- Screenshots of errors or UI issues
- Diagrams, charts, or visual content
- Extracting text from images (OCR)
- Analyzing code in screenshots
- Visual debugging

## Tools Reference

### web_search

| Parameter | Type   | Required | Description                     |
| --------- | ------ | -------- | ------------------------------- |
| query     | string | ✓        | Search query (2-500 characters) |

**Example:**
```typescript
web_search({
  query: "Pi coding agent extensions guide"
})
```

**Returns:** List of search results with titles, URLs, snippets, and follow-up suggestions.

### understand_image

| Parameter | Type   | Required | Description                                      |
| --------- | ------ | -------- | ------------------------------------------------ |
| prompt    | string | ✓        | Question or analysis request (1-1000 characters) |
| image_url | string | ✓        | Image URL or local file path                     |

**Example:**
```typescript
understand_image({
  prompt: "What is in this image?",
  image_url: "https://example.com/screenshot.png"
})
```

**Returns:** AI analysis of the image content based on your prompt.

## Extension Commands

| Command              | Description                     |
| -------------------- | ------------------------------- |
| `/minimax-configure` | Configure API key               |
| `/minimax-status`    | Show configuration status       |
| `/reload`            | Hot reload extension (built-in) |

## Skills

This extension includes built-in skills to help the LLM understand when and how to use each tool:

- `/skill:minimax-web-search` - Guidance on effective web search queries
- `/skill:minimax-image-understanding` - Tips for image analysis prompts

Skills are automatically included in the system prompt when relevant.

## Learn More

- [MiniMax MCP Documentation](https://platform.minimax.io/docs/coding-plan/mcp-guide) - Official MCP API guide
- [MiniMax Coding Plan](https://platform.minimax.io/subscribe/coding-plan) - Subscribe to access MCP tools
- [minimax-coding-plan-mcp (PyPI)](https://pypi.org/project/minimax-coding-plan-mcp/) - Official Python MCP server
- [pi coding agent](https://github.com/badlogic/pi-mono) - The coding agent this extension supports

## Project Structure

```
pi-extension-minimax-coding-plan-mcp/
├── extensions/               # TypeScript extension (loaded directly by pi)
│   └── index.ts              # Source code
├── skills/                   # Skills directory (auto-discovered by pi)
│   ├── minimax-web-search/
│   │   └── SKILL.md          # Web search skill
│   └── minimax-image-understanding/
│       └── SKILL.md          # Image understanding skill
├── package.json              # npm package config
├── REVERSE_ENGINEERING.md    # Reverse engineering documentation
└── README.md                 # This file
```

## Development

```bash
# Install dependencies
npm install

# Start pi - it loads TypeScript directly
pi
```

No build step needed! pi loads `.ts` files directly from the `extensions/` directory.
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

1. Get your API key at https://platform.minimax.io/user-center/payment/coding-plan
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
4. For detailed error information, check the `Trace-Id` in error messages
5. Compare behavior with [minimax-coding-plan-mcp](https://pypi.org/project/minimax-coding-plan-mcp/) if issues persist

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

### API Key Not Saved to auth.json

Make sure the `~/.pi/agent/auth.json` file has the correct format:
```json
{
  "minimax": {
    "type": "api_key",
    "key": "your-api-key-here"
  }
}
```

Use `/minimax-configure --show` to check if your key is configured correctly.

### Extension Not Updating

If changes don't appear after updating, clear the cached version:

```bash
# Remove the cached git repository
rm -rf ~/.pi/agent/git/github.com/imsus/pi-extension-minimax-coding-plan-mcp

# Restart pi to re-clone the latest version
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature'`)
5. Open Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- 📖 [Documentation](https://github.com/imsus/pi-extension-minimax-coding-plan-mcp#readme)
- 🐛 [Issues](https://github.com/imsus/pi-extension-minimax-coding-plan-mcp/issues)
- 💬 [Discussions](https://github.com/imsus/pi-extension-minimax-coding-plan-mcp/discussions)

---

**npm Package**: [@imsus/pi-extension-minimax-coding-plan-mcp](https://www.npmjs.com/package/@imsus/pi-extension-minimax-coding-plan-mcp)

## Changelog

### v1.0.0 (2026-01-29)

- ✨ Initial release
- 🔍 web_search tool with rich results
- 🖼️ understand_image tool with AI analysis
- 📖 Built-in skills for tool guidance
- ⚙️ Configuration commands (/minimax-configure, /minimax-status)
- 🎨 Rich UI with custom rendering
- 🔄 Hot reload support
