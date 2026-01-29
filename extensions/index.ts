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
import { Text } from "@mariozechner/pi-tui";
import { Type } from "@sinclair/typebox";
import { readFileSync, existsSync, readFile as readFileCallback, writeFileSync } from "fs";
import { promisify } from "util";
const readFile = promisify(readFileCallback);
import { join } from "path";
import { homedir } from "os";

/**
 * Configuration state for the MiniMax extension
 * 
 * @internal
 */
interface MiniMaxConfig {
  /** The MiniMax API key */
  apiKey: string;
  /** The API host URL */
  apiHost: string;
  /** Whether the extension is configured */
  configured: boolean;
}

/**
 * Details about tool execution for UI rendering
 * 
 * @internal
 */
interface MiniMaxToolDetails {
  /** Current status: searching, processing, analyzing, complete, error, cancelled */
  status: string;
  /** Raw API response data */
  raw?: Record<string, unknown>;
  /** Error message if status is error */
  error?: string;
  /** HTTP status code */
  statusCode?: number;
  /** Search query for web_search tool */
  query?: string;
  /** Prompt for understand_image tool */
  prompt?: string;
  /** Image URL for understand_image tool */
  imageUrl?: string;
  /** Number of results for web_search tool */
  resultCount?: number;
}

/**
 * Load MiniMax API key from auth file
 * 
 * Searches for API key in ~/.pi/agent/auth.json under "minimax" or "minimax_cn" entries.
 * 
 * @returns The API key if found, null otherwise
 * @internal
 */
function loadApiKeyFromAuthFile(): string | null {
  const homedirPath = homedir();
  const authFilePath = join(homedirPath, ".pi", "agent", "auth.json");

  if (existsSync(authFilePath)) {
    try {
      const content = readFileSync(authFilePath, "utf-8");
      const auth = JSON.parse(content);
      // Check for minimax entry
      if (auth.minimax?.key) {
        return auth.minimax.key;
      }
      // Also check for minimax_cn (China region)
      if (auth.minimax_cn?.key) {
        return auth.minimax_cn.key;
      }
    } catch {
      // Ignore parse errors
    }
  }

  return null;
}

/**
 * Save MiniMax API key to auth file
 * 
 * Writes the API key to ~/.pi/agent/auth.json with secure permissions (0600).
 * 
 * @param apiKey - The API key to save
 * @internal
 */
function saveApiKeyToAuthFile(apiKey: string): void {
  const homedirPath = homedir();
  const authFilePath = join(homedirPath, ".pi", "agent", "auth.json");

  let auth: Record<string, any> = {};

  // Load existing auth file if it exists
  if (existsSync(authFilePath)) {
    try {
      const content = readFileSync(authFilePath, "utf-8");
      auth = JSON.parse(content);
    } catch {
      // Ignore parse errors, start fresh
    }
  }

  // Update minimax entry
  auth.minimax = {
    type: "api_key",
    key: apiKey,
  };

  // Write auth file with secure permissions (0600)
  writeFileSync(authFilePath, JSON.stringify(auth, null, 2), { mode: 0o600 });
}

/**
 * Remove MiniMax API key from auth file
 */
function removeApiKeyFromAuthFile(): void {
  const homedirPath = homedir();
  const authFilePath = join(homedirPath, ".pi", "agent", "auth.json");

  if (!existsSync(authFilePath)) {
    return;
  }

  try {
    const content = readFileSync(authFilePath, "utf-8");
    const auth = JSON.parse(content);

    // Remove minimax entry
    delete auth.minimax;
    delete auth.minimax_cn;

    // Write updated auth file
    writeFileSync(authFilePath, JSON.stringify(auth, null, 2), { mode: 0o600 });
  } catch {
    // Ignore errors
  }
}

/**
 * Convert image to base64 data URL format
 * 
 * Handles three types of image inputs:
 * - HTTP/HTTPS URLs: Downloads and converts to base64
 * - Local file paths: Reads and converts to base64
 * - Existing base64 data URLs: Passes through unchanged
 * 
 * @param imageUrl - The image URL, data URL, or local file path
 * @returns Base64 data URL in format "data:image/{format};base64,{data}"
 * @throws Error if image cannot be downloaded or read
 * @internal
 */
async function processImageUrl(imageUrl: string): Promise<string> {
  // Remove @ prefix if present
  if (imageUrl.startsWith("@")) {
    imageUrl = imageUrl.slice(1);
  }

  // If already in base64 data URL format, pass through
  if (imageUrl.startsWith("data:")) {
    return imageUrl;
  }

  // Handle HTTP/HTTPS URLs
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type")?.toLowerCase() || "";
    let imageFormat = "jpeg";
    if (contentType.includes("png")) {
      imageFormat = "png";
    } else if (contentType.includes("webp")) {
      imageFormat = "webp";
    } else if (contentType.includes("jpg") || contentType.includes("jpeg")) {
      imageFormat = "jpeg";
    }

    const imageData = await response.arrayBuffer();
    const base64Data = Buffer.from(imageData).toString("base64");
    return `data:image/${imageFormat};base64,${base64Data}`;
  }

  // Handle local file paths
  else {
    if (!existsSync(imageUrl)) {
      throw new Error(`Local image file does not exist: ${imageUrl}`);
    }

    const imageData = await readFile(imageUrl, null);
    let imageFormat = "jpeg";
    if (imageUrl.toLowerCase().endsWith(".png")) {
      imageFormat = "png";
    } else if (imageUrl.toLowerCase().endsWith(".webp")) {
      imageFormat = "webp";
    } else if (imageUrl.toLowerCase().endsWith(".jpg") || imageUrl.toLowerCase().endsWith(".jpeg")) {
      imageFormat = "jpeg";
    }

    const base64Data = Buffer.from(imageData).toString("base64");
    return `data:image/${imageFormat};base64,${base64Data}`;
  }
}

export default function (pi: ExtensionAPI) {
  // Configuration state - check sources in priority order:
  // 1. Environment variable (MINIMAX_API_KEY or MINIMAX_CN_API_KEY)
  // 2. auth.json file (~/.pi/agent/auth.json)
  let config: MiniMaxConfig = {
    apiKey: process.env.MINIMAX_API_KEY ?? process.env.MINIMAX_CN_API_KEY ?? "",
    apiHost: process.env.MINIMAX_API_HOST ?? "https://api.minimax.io",
    configured: false,
  };

  // Load from auth.json if not set via environment variable
  if (!config.apiKey) {
    const authKey = loadApiKeyFromAuthFile();
    if (authKey) {
      config.apiKey = authKey;
      config.configured = true;
    }
  } else {
    config.configured = true;
  }

  // Notify on load
  pi.on("session_start", async (_event, ctx) => {
    if (config.configured) {
      ctx.ui.notify("✓ MiniMax MCP tools available (web_search, understand_image)", "info");
    } else {
      ctx.ui.notify("⚠ MiniMax API key not configured. Use /minimax-configure", "warning");
    }
  });

  // Register configuration command
  pi.registerCommand("minimax-configure", {
    description: "Configure MiniMax API key for MCP tools",
    handler: async (args, ctx) => {
      // Check for --help flag
      if (args?.includes("--help") || args?.includes("-h")) {
        const helpText = `
/minimax-configure [options]

Options:
  --key <api_key>    Set API key directly
  --clear            Clear configured API key
  --show             Show current configuration status
  --help, -h         Show this help message

Environment variables:
  MINIMAX_API_KEY    Your MiniMax Coding Plan API key
  MINIMAX_API_HOST   API endpoint (default: https://api.minimax.io)

Get your API key:
  https://platform.minimax.io/subscribe/coding-plan
        `.trim();

        ctx.ui.notify(helpText, "info");
        return;
      }

      // Check for --show flag
      if (args?.includes("--show")) {
        const status = config.configured
          ? `✓ Configured\nAPI Host: ${config.apiHost}\nKey: ${config.apiKey.slice(0, 8)}...`
          : "✗ Not configured";
        ctx.ui.notify(status, "info");
        return;
      }

      // Check for --clear flag
      if (args?.includes("--clear")) {
        const confirmClear = await ctx.ui.confirm(
          "Clear MiniMax Configuration",
          "This will remove your API key from ~/.pi/agent/auth.json"
        );

        if (confirmClear) {
          removeApiKeyFromAuthFile();
          config.apiKey = "";
          config.configured = false;
          ctx.ui.notify("✓ Configuration cleared from auth.json", "info");
        }
        return;
      }

      // Check for API key in arguments
      const keyMatch = args?.match(/--key[=:\s]+([^\s]+)/i);
      if (keyMatch) {
        const newKey = keyMatch[1];

        // Confirm before saving
        const confirmSave = await ctx.ui.confirm(
          "Save MiniMax API Key?",
          `This will save to ~/.pi/agent/auth.json`
        );

        if (confirmSave) {
          saveApiKeyToAuthFile(newKey);
          config.apiKey = newKey;
          config.configured = true;
          ctx.ui.notify("✓ MiniMax API key saved to auth.json", "info");
        }
        return;
      }

      // Prompt for API key with context
      const message = `
Enter your MiniMax Coding Plan API key.

To get an API key:
1. Visit https://platform.minimax.io/subscribe/coding-plan
2. Subscribe to a plan
3. Copy your API key from the dashboard

Your API key will be saved to ~/.pi/agent/auth.json
      `.trim();

      const apiKey = await ctx.ui.input("MiniMax API Key:", message);

      if (apiKey && apiKey.trim()) {
        const confirmSave = await ctx.ui.confirm(
          "Save MiniMax API Key?",
          "Save this API key to ~/.pi/agent/auth.json?"
        );

        if (confirmSave) {
          saveApiKeyToAuthFile(apiKey.trim());
          config.apiKey = apiKey.trim();
          config.configured = true;
          ctx.ui.notify("✓ MiniMax API key saved to auth.json", "info");
        }
      } else {
        ctx.ui.notify("Configuration cancelled", "warning");
      }
    },

    getArgumentCompletions: (prefix: string) => {
      const options = ["--help", "--show", "--clear", "--key "];
      return options
        .filter((opt) => opt.startsWith(prefix))
        .map((opt) => ({ value: opt, label: opt }));
    },
  });

  // Register status command
  pi.registerCommand("minimax-status", {
    description: "Show MiniMax MCP configuration status",
    handler: async (_args, ctx) => {
      if (config.configured) {
        const status = [
          "✓ MiniMax MCP Configured",
          "",
          `API Host: ${config.apiHost}`,
          `API Key: ${config.apiKey.slice(0, 8)}...${config.apiKey.slice(-4)}`,
          "",
          "Available tools:",
          "  • web_search - Search the web",
          "  • understand_image - Analyze images",
        ].join("\n");

        ctx.ui.notify(status, "info");
      } else {
        ctx.ui.notify(
          "✗ MiniMax MCP not configured\n\nUse /minimax-configure to set up your API key",
          "warning"
        );
      }
    },
  });

  // Helper function to validate API key
  async function validateApiKey(): Promise<boolean> {
    if (!config.apiKey) return false;

    try {
      const testEndpoint = `${config.apiHost}/v1/coding_plan/search`;
      const response = await fetch(testEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiKey}`,
          "MM-API-Source": "pi-minimax-mcp",
        },
        body: JSON.stringify({ q: "test" }),
      });

      return response.status !== 401 && response.status !== 403;
    } catch {
      return true;
    }
  }

  // Register web_search tool
  pi.registerTool({
    name: "web_search",
    label: "Web Search",
    description: `Search the web for information based on a query. Returns search results and related search suggestions.

Usage:
- web_search({ query: "TypeScript best practices 2025" })
- web_search({ query: "How to configure pi coding agent" })

Example:
Query: "React server components tutorial"
Returns: List of relevant web pages with titles, URLs, snippets, and date

Tips:
- Use 3-5 keywords for better results
- Add current year for time-sensitive queries (e.g., "React 19 features 2025")
- Be specific: "TypeScript 5.4 generics" instead of "TypeScript help"`,

    parameters: Type.Object({
      query: Type.String({
        description: "Search query string. Use 3-5 keywords. Add current year for time-sensitive queries.",
        minLength: 2,
        maxLength: 500,
      }),
    }),

    async execute(toolCallId, params, onUpdate, ctx, signal) {
      // Validate configuration
      if (!config.configured) {
        return createErrorResult(
          "MiniMax API key not configured",
          "Use /minimax-configure to set your API key, or set MINIMAX_API_KEY environment variable"
        );
      }

      if (!params.query || params.query.trim().length < 2) {
        return createErrorResult(
          "Invalid query",
          "Query must be at least 2 characters long"
        );
      }

      // Show progress
      onUpdate?.({
        content: [{ type: "text" as const, text: `🔍 Searching: "${params.query}"` }],
        details: { status: "searching", query: params.query } satisfies MiniMaxToolDetails,
      });

      try {
        const response = await fetch(`${config.apiHost}/v1/coding_plan/search`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${config.apiKey}`,
            "MM-API-Source": "pi-minimax-mcp",
          },
          body: JSON.stringify({ q: params.query.trim() }),
          signal,
        });

        if (!response.ok) {
          const errorText = await response.text();

          // Handle authentication errors
          if (response.status === 401 || response.status === 403) {
            config.configured = false;
            return createErrorResult(
              "Authentication failed",
              "Invalid API key. Check your API key and API host. Global: https://api.minimax.io, Mainland China: https://api.minimaxi.com"
            );
          }

          return createErrorResult(
            `API error (${response.status})`,
            errorText || "Unknown error occurred"
          );
        }

        const result = await response.json() as any;

        // Check MiniMax API error code
        const baseResp = result.base_resp || {};
        if (baseResp.status_code !== 0) {
          switch (baseResp.status_code) {
            case 1004:
              return createErrorResult(
                "Authentication error",
                `${baseResp.status_msg}. Check your API key and API host. Trace-Id: ${response.headers.get("Trace-Id")}`
              );
            case 2038:
              return createErrorResult(
                "Verification required",
                `${baseResp.status_msg}. Complete real-name verification at https://platform.minimaxi.com/user-center/basic-information. Trace-Id: ${response.headers.get("Trace-Id")}`
              );
            default:
              return createErrorResult(
                `API error (${baseResp.status_code})`,
                `${baseResp.status_msg}. Trace-Id: ${response.headers.get("Trace-Id")}`
              );
          }
        }

        // Format the results
        const formattedResults = formatSearchResults(result);

        return {
          content: [{ type: "text" as const, text: formattedResults }],
          details: {
            status: "complete",
            query: params.query,
            resultCount: result.organic?.length ?? 0,
            raw: result,
          } satisfies MiniMaxToolDetails,
        };
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return {
            content: [{ type: "text" as const, text: "Search cancelled" }],
            details: { status: "cancelled" } satisfies MiniMaxToolDetails,
          };
        }

        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return createErrorResult("Search failed", errorMessage);
      }
    },

    renderCall(args, theme) {
      let text = theme.fg("toolTitle", theme.bold("🔍 web_search "));
      text += theme.fg("muted", `"${args.query}"`);
      return new Text(text, 0, 0);
    },

    renderResult(result, { expanded }, theme) {
      const details = result.details as MiniMaxToolDetails;

      if (details.error) {
        const text = theme.fg("error", "✗ Error");
        return new Text(text, 0, 0);
      }

      const status = details.status === "complete" ? "✓" : "●";
      const color = details.status === "complete" ? "success" : "warning";
      let text = theme.fg(color, `${status} Search complete`);

      if (expanded && details.raw) {
        text += "\n" + theme.fg("dim", JSON.stringify(details.raw, null, 2));
      }

      return new Text(text, 0, 0);
    },
  });

  // Register understand_image tool
  pi.registerTool({
    name: "understand_image",
    label: "Understand Image",
    description: `Analyze and understand image content using AI.

Usage:
- understand_image({ 
    prompt: "What is in this image?",
    image_url: "https://example.com/screenshot.png"
  })
- understand_image({ 
    prompt: "Extract text from this image (OCR)",
    image_url: "/path/to/local/image.jpg"
  })

Image sources:
- HTTP/HTTPS URLs: "https://example.com/image.jpg"
- Local file paths: "/Users/username/Documents/image.jpg" or "images/photo.png"
- Removes @ prefix if present in file paths

Supported formats: JPEG, PNG, WebP (max size varies)

Examples:
- Analyze screenshots, diagrams, or photos
- Extract text from images (OCR)
- Describe visual content
- Identify UI components or code in screenshots`,

    parameters: Type.Object({
      prompt: Type.String({
        description: "Question or analysis request for the image",
        minLength: 1,
        maxLength: 1000,
      }),
      image_url: Type.String({
        description: "Image source - HTTP/HTTPS URL or local file path. Removes @ prefix if present.",
        minLength: 1,
        maxLength: 2000,
      }),
    }),

    async execute(toolCallId, params, onUpdate, ctx, signal) {
      // Validate configuration
      if (!config.configured) {
        return createErrorResult(
          "MiniMax API key not configured",
          "Use /minimax-configure to set your API key, or set MINIMAX_API_KEY environment variable"
        );
      }

      if (!params.prompt || !params.image_url) {
        return createErrorResult(
          "Missing parameters",
          "Both 'prompt' and 'image_url' are required"
        );
      }

      // Show progress
      onUpdate?.({
        content: [{ type: "text" as const, text: `🖼 Converting image to base64...` }],
        details: { status: "processing" } satisfies MiniMaxToolDetails,
      });

      try {
        // Process image to base64 data URL
        const base64ImageUrl = await processImageUrl(params.image_url);

        onUpdate?.({
          content: [{ type: "text" as const, text: `🖼 Analyzing image...` }],
          details: { status: "analyzing" } satisfies MiniMaxToolDetails,
        });

        const response = await fetch(`${config.apiHost}/v1/coding_plan/vlm`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${config.apiKey}`,
            "MM-API-Source": "pi-minimax-mcp",
          },
          body: JSON.stringify({
            prompt: params.prompt,
            image_url: base64ImageUrl,
          }),
          signal,
        });

        if (!response.ok) {
          const errorText = await response.text();

          // Handle authentication errors
          if (response.status === 401 || response.status === 403) {
            config.configured = false;
            return createErrorResult(
              "Authentication failed",
              "Invalid API key. Check your API key and API host. Global: https://api.minimax.io, Mainland China: https://api.minimaxi.com"
            );
          }

          return createErrorResult(
            `API error (${response.status})`,
            errorText || "Unknown error occurred"
          );
        }

        const result = await response.json() as any;

        // Check MiniMax API error code
        const baseResp = result.base_resp || {};
        if (baseResp.status_code !== 0) {
          switch (baseResp.status_code) {
            case 1004:
              return createErrorResult(
                "Authentication error",
                `${baseResp.status_msg}. Check your API key and API host. Trace-Id: ${response.headers.get("Trace-Id")}`
              );
            case 2038:
              return createErrorResult(
                "Verification required",
                `${baseResp.status_msg}. Complete real-name verification at https://platform.minimaxi.com/user-center/basic-information. Trace-Id: ${response.headers.get("Trace-Id")}`
              );
            default:
              return createErrorResult(
                `API error (${baseResp.status_code})`,
                `${baseResp.status_msg}. Trace-Id: ${response.headers.get("Trace-Id")}`
              );
          }
        }

        const content = result.content;

        if (!content) {
          return createErrorResult(
            "No content returned",
            "The VLM API didn't return any analysis content"
          );
        }

        return {
          content: [{ type: "text" as const, text: content }],
          details: {
            status: "complete",
            prompt: params.prompt,
            imageUrl: params.image_url,
            raw: result,
          } satisfies MiniMaxToolDetails,
        };
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return {
            content: [{ type: "text" as const, text: "Analysis cancelled" }],
            details: { status: "cancelled" } satisfies MiniMaxToolDetails,
          };
        }

        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return createErrorResult("Analysis failed", errorMessage);
      }
    },

    renderCall(args, theme) {
      let text = theme.fg("toolTitle", theme.bold("🖼 understand_image "));
      text += theme.fg("muted", `"${args.prompt.slice(0, 30)}..."`);
      text += "\n" + theme.fg("dim", `  Image: ${args.image_url.slice(0, 50)}...`);
      return new Text(text, 0, 0);
    },

    renderResult(result, { expanded }, theme) {
      const details = result.details as MiniMaxToolDetails;

      if (details.error) {
        const text = theme.fg("error", "✗ Error");
        return new Text(text, 0, 0);
      }

      const status = details.status === "complete" ? "✓" : "●";
      const color = details.status === "complete" ? "success" : "warning";
      let text = theme.fg(color, `${status} Analysis complete`);

      if (expanded && details.raw) {
        text += "\n" + theme.fg("dim", JSON.stringify(details.raw, null, 2));
      }

      return new Text(text, 0, 0);
    },
  });
}

/**
 * Create an error result with proper formatting
 * 
 * @param title - The error title
 * @param message - The error message
 * @returns Formatted error result for pi tool response
 * @internal
 */
function createErrorResult(title: string, message: string) {
  return {
    content: [{ type: "text" as const, text: `Error: ${title}\n${message}` }],
    details: { status: "error", error: `${title}: ${message}` },
    isError: true,
  };
}

/**
 * Format search results from MiniMax API into readable text
 * 
 * Parses the MiniMax search response and formats it with:
 * - Numbered search results with title, URL, snippet, and date
 * - Related searches section
 * 
 * @param result - The raw API response from MiniMax search
 * @returns Formatted human-readable search results
 * @internal
 */
function formatSearchResults(result: any): string {
  if (!result) return "No results found";

  let output = "";

  // Handle organic results
  if (result.organic && Array.isArray(result.organic)) {
    output = "🔍 Search Results\n\n";

    result.organic.forEach((item: any, index: number) => {
      const title = item.title ?? "No title";
      const link = item.link ?? "N/A";
      const snippet = item.snippet ?? "";
      const date = item.date ?? "";

      output += `${index + 1}. ${title}\n`;
      output += `   📎 ${link}\n`;

      if (snippet) {
        const truncatedSnippet = snippet.length > 200
          ? snippet.slice(0, 200) + "..."
          : snippet;
        output += `   ${truncatedSnippet}\n`;
      }

      if (date) {
        output += `   📅 ${date}\n`;
      }

      output += "\n";
    });
  }

  // Check for related searches
  if (result.related_searches && Array.isArray(result.related_searches) && result.related_searches.length > 0) {
    output += "💡 Related Searches:\n";
    result.related_searches.forEach((suggestion: any, index: number) => {
      const query = suggestion.query ?? "";
      output += `  ${index + 1}. ${query}\n`;
    });
    output += "\n";
  }

  // Fallback to raw JSON if we couldn't parse
  if (!output) {
    output = JSON.stringify(result, null, 2);
  }

  return output;
}
