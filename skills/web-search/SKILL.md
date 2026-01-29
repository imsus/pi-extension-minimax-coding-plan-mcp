---
name: minimax-web-search
description: Search the web for current information using MiniMax web_search tool
parameters:
  query: Search query string (2-500 characters)
---

# MiniMax Web Search Skill

Use this skill when you need to find current, real-time, or authoritative information that may have changed since my knowledge cutoff.

## When to Use

Use `web_search` when:

- **Current events**: News, recent developments, latest releases
- **Fact verification**: Checking if information is still accurate
- **Technical updates**: New versions, patches, breaking changes
- **Dynamic content**: Prices, availability, schedules
- **Authoritative sources**: Official documentation, API references

## When NOT to Use

Do NOT use `web_search` when:

- **General knowledge** I likely know (historical facts, basic concepts)
- **Coding help** for common patterns (unless asking about latest practices)
- **Opinion-based questions** without specific recent information needs
- **Files already in context** or accessible via `read` tool

## Usage

```
web_search({
  query: "your search query here"
})
```

## Tips for Better Results

1. **Be specific**: "TypeScript 5.4 new features" vs "TypeScript updates"
2. **Include context**: "React 19 server components vs client components"
3. **Use recent keywords**: "2024" or "2025" when timing matters
4. **Target authoritative sources**: Include product names, official sites

## Examples

### Good Queries
- "Node.js 22 new features"
- "Claude Code vs pi coding agent 2025"
- "React 19 release date official"
- "Docker desktop alternatives 2024"

### Poor Queries
- "how to use TypeScript" (too general)
- "is Python popular" (opinion, not time-sensitive)
- "help me debug my code" (not a search task)

## Response Format

Results include:
- **Titles** and **URLs** for each result
- **Snippets** with relevant context
- **Suggestions** for follow-up searches

You can use the suggestions to refine your search or ask the user which direction they'd like to explore.
