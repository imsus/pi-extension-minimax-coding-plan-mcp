/**
 * MiniMax MCP Extension for pi coding agent
 * 
 * Provides web_search and understand_image tools from MiniMax Coding Plan MCP
 * 
 * Prerequisites:
 * - MiniMax Coding Plan subscription: https://platform.minimax.io/subscribe/coding-plan
 * - API Key from MiniMax platform
 * 
 * Installation:
 * 1. npm install pi-minimax-mcp
 * 2. Add to ~/.pi/settings.json:
 *    {
 *      "packages": ["npm:pi-minimax-mcp@latest"]
 *    }
 * 
 * Or set environment variables:
 * - MINIMAX_API_KEY: Your MiniMax API key
 * - MINIMAX_API_HOST: API endpoint (default: https://api.minimax.io)
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Text } from "@mariozechner/pi-tui";
import { Type } from "@sinclair/typebox";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";

interface MiniMaxConfig {
  apiKey: string;
  apiHost: string;
  configured: boolean;
}

interface MiniMaxToolDetails {
  status: string;
  raw?: any;
  error?: string;
  statusCode?: number;
  query?: string;
  prompt?: string;
  imageUrl?: string;
  resultCount?: number;
}

/**
 * Load MiniMax API key from settings files
 * Priority: project .pi/settings.json > ~/.pi/agent/settings.json
 */
function loadApiKeyFromSettings(): string | null {
  const homedirPath = homedir();
  const globalSettingsPath = join(homedirPath, ".pi", "agent", "settings.json");
  const projectSettingsPath = join(process.cwd(), ".pi", "settings.json");

  // Check project settings first (higher priority, can override global)
  if (existsSync(projectSettingsPath)) {
    try {
      const content = readFileSync(projectSettingsPath, "utf-8");
      const settings = JSON.parse(content);
      if (settings.minimax?.key) {
        return settings.minimax.key;
      }
    } catch {
      // Ignore parse errors
    }
  }

  // Check global settings
  if (existsSync(globalSettingsPath)) {
    try {
      const content = readFileSync(globalSettingsPath, "utf-8");
      const settings = JSON.parse(content);
      if (settings.minimax?.key) {
        return settings.minimax.key;
      }
    } catch {
      // Ignore parse errors
    }
  }

  return null;
}

export default function (pi: ExtensionAPI) {
  // Configuration state - check sources in priority order:
  // 1. Environment variable
  // 2. Project settings (.pi/settings.json)
  // 3. Global settings (~/.pi/agent/settings.json)
  let config: MiniMaxConfig = {
    apiKey: process.env.MINIMAX_API_KEY ?? "",
    apiHost: process.env.MINIMAX_API_HOST ?? "https://api.minimax.io",
    configured: false,
  };

  // Load from settings files if not set via env var
  if (!config.apiKey) {
    const settingsKey = loadApiKeyFromSettings();
    if (settingsKey) {
      config.apiKey = settingsKey;
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
          "This will remove your API key from the current session."
        );
        
        if (confirmClear) {
          config.apiKey = "";
          config.configured = false;
          ctx.ui.notify("✓ Configuration cleared", "info");
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
          `Key: ${newKey.slice(0, 8)}...${newKey.slice(-4)}`
        );
        
        if (confirmSave) {
          config.apiKey = newKey;
          config.configured = true;
          ctx.ui.notify("✓ MiniMax API key saved", "info");
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

Your API key will only be stored in memory during this session.
      `.trim();

      const apiKey = await ctx.ui.input("MiniMax API Key:", message);

      if (apiKey && apiKey.trim()) {
        const confirmSave = await ctx.ui.confirm(
          "Save MiniMax API Key?",
          "Save this API key for the current session?"
        );
        
        if (confirmSave) {
          config.apiKey = apiKey.trim();
          config.configured = true;
          ctx.ui.notify("✓ MiniMax API key configured", "info");
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
      const testEndpoint = `${config.apiHost}/mcp/ping`;
      const response = await fetch(testEndpoint, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
        },
      });

      // Some APIs return 404 for ping but that's OK - just means endpoint exists
      return response.status !== 401 && response.status !== 403;
    } catch {
      // If we can't reach the endpoint, assume it's configured
      return true;
    }
  }

  // Register web_search tool
  pi.registerTool({
    name: "web_search",
    label: "Web Search",
    description: `Search the web for information based on a query. Returns search results and related suggestions.

Usage:
- web_search({ query: "TypeScript best practices 2024" })
- web_search({ query: "How to configure pi coding agent" })

Example:
Query: "React server components tutorial"
Returns: List of relevant web pages with titles, URLs, and snippets`,

    parameters: Type.Object({
      query: Type.String({
        description: "Search query",
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
        const response = await fetch(`${config.apiHost}/mcp/web_search`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${config.apiKey}`,
          },
          body: JSON.stringify({ query: params.query.trim() }),
          signal,
        });

        if (!response.ok) {
          const errorText = await response.text();
          
          // Handle authentication errors
          if (response.status === 401 || response.status === 403) {
            config.configured = false;
            return createErrorResult(
              "Authentication failed",
              "Invalid API key. Use /minimax-configure to update your credentials."
            );
          }

          return createErrorResult(
            `API error (${response.status})`,
            errorText || "Unknown error occurred"
          );
        }

        const result = await response.json() as { results?: Array<unknown>; suggestions?: Array<unknown> };

        // Format the results
        const formattedResults = formatSearchResults(result);

        return {
          content: [{ type: "text" as const, text: formattedResults }],
          details: {
            status: "complete",
            query: params.query,
            resultCount: result.results?.length ?? 0,
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

Supported formats: JPEG, PNG, GIF, WebP (max 20MB)

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
        description: "Image source - HTTP/HTTPS URL or local file path",
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

      // Validate image URL format
      const urlPattern = /^https?:\/\/.+|^[\/\.].+/;
      if (!urlPattern.test(params.image_url)) {
        return createErrorResult(
          "Invalid image URL",
          "Image URL must be an HTTP/HTTPS URL or a local file path starting with / or ./"
        );
      }

      // Show progress with confirmation for potentially expensive operations
      const isLargePrompt = params.prompt.length > 200;
      const isComplexTask = /describe|analyze|extract|recognize/i.test(params.prompt);

      if (isComplexTask) {
        const confirmAnalyze = await ctx.ui.confirm(
          "Analyze Image?",
          `This analysis may take time. Continue with: "${params.prompt.slice(0, 50)}..."?`
        );

        if (!confirmAnalyze) {
          return {
            content: [{ type: "text" as const, text: "Analysis cancelled" }],
            details: { status: "cancelled" } satisfies MiniMaxToolDetails,
          };
        }
      }

      onUpdate?.({
        content: [{ type: "text" as const, text: `🖼 Analyzing image...` }],
        details: { status: "analyzing" } satisfies MiniMaxToolDetails,
      });

      try {
        const response = await fetch(`${config.apiHost}/mcp/understand_image`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${config.apiKey}`,
          },
          body: JSON.stringify({
            prompt: params.prompt,
            image_url: params.image_url,
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
              "Invalid API key. Use /minimax-configure to update your credentials."
            );
          }

          return createErrorResult(
            `API error (${response.status})`,
            errorText || "Unknown error occurred"
          );
        }

        const result = await response.json() as { analysis?: string };

        return {
          content: [{ type: "text" as const, text: result.analysis ?? JSON.stringify(result) }],
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
 */
function formatSearchResults(result: any): string {
  if (!result) return "No results found";

  let output = "";

  // Handle different response formats
  if (result.results && Array.isArray(result.results)) {
    output = "🔍 Search Results\n\n";
    
    result.results.forEach((item: any, index: number) => {
      const title = item.title ?? "No title";
      const url = item.url ?? "N/A";
      const snippet = item.snippet ?? "";

      output += `${index + 1}. ${title}\n`;
      output += `   📎 ${url}\n`;
      
      if (snippet) {
        const truncatedSnippet = snippet.length > 200 
          ? snippet.slice(0, 200) + "..." 
          : snippet;
        output += `   ${truncatedSnippet}\n`;
      }
      
      output += "\n";
    });
  }

  // Check for suggestions
  if (result.suggestions && Array.isArray(result.suggestions) && result.suggestions.length > 0) {
    output += "💡 Suggestions:\n";
    result.suggestions.forEach((suggestion: string, index: number) => {
      output += `  ${index + 1}. ${suggestion}\n`;
    });
    output += "\n";
  }

  // Fallback to raw JSON if we couldn't parse
  if (!output) {
    output = JSON.stringify(result, null, 2);
  }

  return output;
}
