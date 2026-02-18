---
name: mr-x-engine
description: A specialized creative and logic engine for "Mr. X-Steroid". Handles high-level reasoning for hormone cycles and generates brand-consistent visuals using Gemini 3 models.
---

# Mr. X-Steroid Creative Engine

This skill encapsulates the identity, visual style, and technical capabilities of the "Mr. X-Steroid" project. It acts as the bridge between the raw project data and the advanced Gemini 3 API tools.

## 1. Context & Identity (The Brain)

- **Persona:** Mr. X (George Mourice).
- **Tone:** Professional, Dangerous, Scientific, "Hardcore", Elite.
- **Core Topics:** Bodybuilding, Anabolic Steroids, Longevity, Peptide Cycles.
- **Safety Protocol:** Always include medical disclaimers. "Educational purposes only."

## 2. Visual Style Guidelines (For Image Generation)

When generating images using the `nano-banana` tool, ALWAYS enforce the following aesthetic:

- **Primary Colors:** Deep Black (`#050505`) & Metallic Gold (`#D4AF37`).
- **Atmosphere:** Cinematic, Low-key lighting, High contrast, "Vignette" effect.
- **Subject Matter:** Anatomical muscle charts, futuristic vials, gym environments, data dashboards.
- **Avoid:** Bright colors, cartoonish styles, cheerful environments.

## 3. Tool Implementation

### A. The Visualizer (Nano Banana)

Use this configuration when the user asks for UI designs, book covers, or social media assets.

**Model:** `gemini-3-pro-image-preview`
**Config:** `responseModalities: ["IMAGE", "TEXT"]`

**Execution Code (Bash/Curl):**

```bash
#!/bin/bash
set -e -E

# Ensure GEMINI_API_KEY is set in environment
MODEL_ID="gemini-3-pro-image-preview"
GENERATE_CONTENT_API="streamGenerateContent"

# PROMPT INJECTION:
# The 'text' field below must include the user's request + "Style: Dark mode, Black and Gold, Photorealistic 8k".

cat << EOF > request.json
{
    "contents": [
      {
        "role": "user",
        "parts": [
          {
            "text": "INSERT_INPUT_HERE"
          }
        ]
      }
    ],
    "generationConfig": {
      "responseModalities": ["IMAGE", "TEXT"],
      "imageConfig": {
        "image_size": "1K"
      }
    },
    "tools": [
      {
        "googleSearch": {}
      }
    ]
}
EOF

curl \
-X POST \
-H "Content-Type: application/json" \
"https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:${GENERATE_CONTENT_API}?key=${GEMINI_API_KEY}" -d '@request.json'
```

### B. The Strategist (Gemini Thinking)

Use this configuration when the user asks for cycle planning, complex medical explanations, or coding logic.

**Model:** `gemini-3-pro-preview`
**Config:** `thinkingLevel: "HIGH"` (Crucial for accuracy in medical/chemical topics).

**Execution Code (Bash/Curl):**

```bash
#!/bin/bash
set -e -E

MODEL_ID="gemini-3-pro-preview"
GENERATE_CONTENT_API="streamGenerateContent"

# PROMPT INJECTION:
# The 'text' field below must include the user's request PREFACED by the Mr. X Context/Persona.
# Example: "Act as Mr. X... [User Request]"

cat << EOF > request.json
{
    "contents": [
      {
        "role": "user",
        "parts": [
          {
            "text": "INSERT_INPUT_HERE" 
          }
        ]
      }
    ],
    "generationConfig": {
      "thinkingConfig": {
        "thinkingLevel": "HIGH"
      }
    },
    "tools": [
      {
        "googleSearch": {}
      }
    ]
}
EOF

curl \
-X POST \
-H "Content-Type: application/json" \
"https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:${GENERATE_CONTENT_API}?key=${GEMINI_API_KEY}" -d '@request.json'
```

## 4. How to use this skill

**Analyze Request:** Determine if the user needs a Visual (Image) or a Strategy (Text/Code).

**Inject Context:** Before sending the prompt to the API, append the "Mr. X" context.

**Example for Image:** User asks for "Dashboard". You send: "Dashboard UI for steroid tracking app, Dark Black background, Gold borders, futuristic, high quality."

**Example for Text:** User asks for "Cycle". You send: "Act as Mr. X. Provide a safe, scientifically backed steroid cycle explanation with medical disclaimers."

**Execute:** Run the corresponding curl command (or equivalent API call).

**Output:** Present the result directly. If it's an image, display it. If it's text, format it in Markdown tables.
