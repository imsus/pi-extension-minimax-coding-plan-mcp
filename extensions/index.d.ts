/**
 * MiniMax Coding Plan MCP Extension for pi coding agent
 *
 * Provides web_search and understand_image tools from MiniMax Coding Plan API
 *
 * ## Features
 * - 🔍 **Web Search** - Search the web for current information
 * - 🖼️ **Image Understanding** - Analyze images with AI
 * - ⚙️ **Configuration** - Support for environment variables and auth.json
 *
 * ## Configuration
 *
 * Environment variables:
 * - `MINIMAX_API_KEY` - Your MiniMax API key
 * - `MINIMAX_API_HOST` - API endpoint (default: https://api.minimax.io)
 * - `MINIMAX_CN_API_KEY` - China region API key
 *
 * Auth file (~/.pi/agent/auth.json):
 * ```json
 * {
 *   "minimax": { "type": "api_key", "key": "your-key" }
 * }
 * ```
 *
 * ## Example Usage
 *
 * ```typescript
 * // Search the web
 * web_search({ query: "TypeScript best practices 2025" })
 *
 * // Analyze an image
 * understand_image({
 *   prompt: "What error is shown?",
 *   image_url: "https://example.com/screenshot.png"
 * })
 * ```
 *
 * ## See Also
 * - [MiniMax Coding Plan](https://platform.minimax.io/subscribe/coding-plan)
 * - [MiniMax MCP Python Package](https://pypi.org/project/minimax-coding-plan-mcp/)
 *
 * @packageDocumentation
 */
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
export default function (pi: ExtensionAPI): void;
//# sourceMappingURL=index.d.ts.map