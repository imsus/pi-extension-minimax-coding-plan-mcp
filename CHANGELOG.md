# Release Notes v1.0.0

**Initial Release** - January 29, 2026

## Overview

`@imsus/pi-extension-minimax-coding-plan-mcp` is a pi extension that provides MiniMax Coding Plan tools (web search and image understanding) as native pi tools. It was reverse-engineered from the official [minimax-coding-plan-mcp](https://pypi.org/project/minimax-coding-plan-mcp/) Python package.

## Features

### 🔍 Web Search Tool

Search the web for current information with rich results:

```typescript
web_search({ query: "TypeScript best practices 2026" })
```

**Returns:**
- Organic search results with titles, URLs, snippets, and dates
- Related search suggestions
- Authoritative and up-to-date information

### 🖼️ Image Understanding Tool

Analyze images with AI for descriptions, OCR, code extraction, and visual analysis:

```typescript
understand_image({
  prompt: "What error is shown in this screenshot?",
  image_url: "https://example.com/error.png"
})
```

**Supported formats:** JPEG, PNG, WebP  
**Sources:** HTTP/HTTPS URLs, local file paths

## Tools Provided

- **`web_search`** - Search the web for current information
- **`understand_image`** - Analyze images with AI
- **`/minimax-configure`** - Configure API key interactively
- **`/minimax-status`** - Show configuration status

## Installation

```bash
# From npm
pi install npm:@imsus/pi-extension-minimax-coding-plan-mcp

# From git
pi install git:https://github.com/imsus/pi-extension-minimax-coding-plan-mcp

# From HTTPS URL
pi install https://github.com/imsus/pi-extension-minimax-coding-plan-mcp
```

See [README.md](README.md) for detailed installation instructions.

## Configuration

### Get Your API Key

1. Subscribe to [MiniMax Coding Plan](https://platform.minimax.io/subscribe/coding-plan)
2. Get your API key from [API Key page](https://platform.minimax.io/user-center/payment/coding-plan)

### Configuration Methods

1. **Environment variable** (recommended):
   ```bash
   export MINIMAX_API_KEY="your-api-key"
   export MINIMAX_API_HOST="https://api.minimax.io"  # optional
   ```

2. **Auth file** (`~/.pi/agent/auth.json`):
   ```json
   {
     "minimax": { "type": "api_key", "key": "your-api-key" }
   }
   ```

3. **Interactive configuration**:
   ```bash
   /minimax-configure --key your-api-key
   ```

## Skills Included

This extension includes built-in skills to guide the LLM:

- **`minimax-web-search`** - Guidance on effective web search queries
- **`minimax-image-understanding`** - Tips for image analysis

## Technical Details

### API Endpoints

| Tool             | Endpoint                            | Payload                              |
| ---------------- | ----------------------------------- | ------------------------------------ |
| web_search       | `POST {host}/v1/coding_plan/search` | `{"q": query}`                       |
| understand_image | `POST {host}/v1/coding_plan/vlm`    | `{"prompt": p, "image_url": base64}` |

### Authentication

- Header: `Authorization: Bearer {api_key}`
- Custom header: `MM-API-Source: pi-minimax-mcp`

### Image Processing

Images are automatically converted to base64 data URLs:
```javascript
data:image/{format};base64,{base64-data}
```

### Package Structure

```
pi-extension-minimax-coding-plan-mcp/
├── extensions/
│   └── index.ts              # Extension source (TypeScript)
├── skills/
│   ├── minimax-web-search/
│   │   └── SKILL.md          # Web search skill
│   └── minimax-image-understanding/
│       └── SKILL.md          # Image understanding skill
├── package.json
└── README.md
```

## Development

No build step required - pi loads TypeScript files directly:

```bash
npm install
pi  # Start pi, it loads extensions/ directly
```

## Changelog

### Initial Release (v1.0.0)

**Core Features:**
- ✨ Initial release with web_search and understand_image tools
- 🔄 Reverse-engineered from official MiniMax MCP Python package
- 📦 Updated API endpoints to match official implementation (`/v1/coding_plan/*`)
- 🖼️ Added image-to-base64 conversion for understand_image
- 🔐 Added MM-API-Source header for authentication
- 🛡️ Enhanced error handling with MiniMax-specific status codes (1004, 2038)
- 🏷️ Added Trace-Id tracking for debugging

**Package Structure:**
- 📁 Restructured to use pi conventional directories
- 📁 Moved source to `extensions/` directory
- 🎯 Renamed to scoped package `@imsus/pi-extension-minimax-coding-plan-mcp`
- 🚀 Simplified to ESM-only (no CommonJS)
- 📝 Added TSDoc comments for better IDE support

**Configuration:**
- ✅ Fixed to use correct pi auth pattern (`~/.pi/agent/auth.json`)
- ✅ Support for both MINIMAX_API_KEY and MINIMAX_CN_API_KEY
- ✅ Interactive `/minimax-configure` command
- ✅ Secure file permissions (0600) for auth.json

**Skills:**
- 📖 Added Agent Skills format compliant SKILL.md files
- 🎓 Guidance on when to use each tool
- 💡 Examples and best practices

**Bug Fixes:**
- 🐛 Removed image analysis confirmation dialog
- 🔧 Clarified tool usage in skills
- 🧹 Removed unused imports
- 🔄 Updated dependencies to fix deprecation warnings

**Documentation:**
- 📚 Comprehensive README with installation and usage guides
- 📖 REVERSE_ENGINEERING.md documenting the reverse engineering process
- 🔧 Updated installation instructions per pi packages documentation

## Dependencies

- `@sinclair/typebox` - Type validation
- `@mariozechner/pi-coding-agent` - pi SDK (peer)
- `@mariozechner/pi-tui` - TUI components (peer)

## Requirements

- pi coding agent
- MiniMax Coding Plan subscription
- Node.js >= 18.0.0

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- 📖 [Documentation](https://github.com/imsus/pi-extension-minimax-coding-plan-mcp#readme)
- 🐛 [Issues](https://github.com/imsus/pi-extension-minimax-coding-plan-mcp/issues)
- 💬 [Discussions](https://github.com/imsus/pi-extension-minimax-coding-plan-mcp/discussions)

## See Also

- [MiniMax MCP Documentation](https://platform.minimax.io/docs/coding-plan/mcp-guide)
- [MiniMax Coding Plan](https://platform.minimax.io/subscribe/coding-plan)
- [minimax-coding-plan-mcp (PyPI)](https://pypi.org/project/minimax-coding-plan-mcp/)
- [pi coding agent](https://github.com/badlogic/pi-mono)
