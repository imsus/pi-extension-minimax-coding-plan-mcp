---
name: minimax-image-understanding
description: Analyze images using AI with MiniMax understand_image tool
parameters:
  prompt: Question or analysis request for the image
  image_url: Image URL or local file path
---

# MiniMax Image Understanding Skill

Use this skill when you need to analyze, describe, or extract information from images.

## When to Use

Use `understand_image` when:

- **Screenshots**: Error messages, UI issues, code in screenshots
- **Visual content**: Photos, diagrams, charts, graphs
- **Documents**: Extracting text from images (OCR), understanding layouts
- **UI/UX analysis**: Evaluating designs, identifying components
- **Visual debugging**: Understanding visual bugs or layout issues

## When NOT to Use

Do NOT use `understand_image` when:

- **Image is already described** in the conversation
- **The image is a simple icon** or emoji you recognize
- **No image is provided** or the image URL is inaccessible
- **Redundant with existing context** (e.g., file contents already visible)

## Usage

```
understand_image({
  prompt: "What do you see in this image?",
  image_url: "https://example.com/screenshot.png"
})
```

## Crafting Effective Prompts

### For Descriptions
- "Describe what's in this image in detail"
- "What is the main subject of this image?"
- "Describe the visual style and composition"

### For Code/Technical
- "What code is shown in this screenshot?"
- "Extract all text from this image"
- "Identify the UI framework/components used"

### For Analysis
- "Analyze this UI design and suggest improvements"
- "What emotions or mood does this image convey?"
- "Compare this design to Material Design principles"

### For OCR/Text Extraction
- "Extract all text from this image"
- "Read the error message in this screenshot"
- "What does the label say in this image?"

## Image Sources

Supports:
- **HTTP/HTTPS URLs**: Direct image links
- **Local paths**: Absolute or relative paths to image files
- **Base64**: Encoded images (if the URL scheme indicates it)

## Examples

### Error Analysis
```
understand_image({
  prompt: "What is the error message and where is it located in this screenshot?",
  image_url: "./error-screenshot.png"
})
```

### Code Screenshot
```
understand_image({
  prompt: "What code is shown in this screenshot? Please transcribe it exactly.",
  image_url: "https://example.com/code.png"
})
```

### Design Review
```
understand_image({
  prompt: "Analyze this UI design. What is working well and what could be improved?",
  image_url: "https://example.com/mockup.png"
})
```

## Tips

1. **Be specific** in your prompt about what you want to know
2. **Mention format** if you need structured output (e.g., "list all elements")
3. **Include context** if the image is part of a larger task
4. **For screenshots**, specify if you need full-page or just a specific area
