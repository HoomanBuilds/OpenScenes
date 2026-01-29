# Prompt Engineering for Slide Generation

Use these guidelines to build the "Master Prompts" for your backend agents.

## 1. The "Base Reality" Prompt (System Message)
Every agent MUST start with a "Base Reality" which defines the physical laws of the canvas:
> "You operating on a 16:9 canvas (1000px by 562px). 0,0 is top-left. Text elements should rarely exceed 800px width. Vertical centering is preferred for headlines."

## 2. Format Enforcement
AI often tries to be helpful by adding markdown or explanations. Enforce strict JSON:
> "Your output must be PARSABLE JSON only. No ```json blocks, no preamble, no 'Here is your template'. Start with [ and end with ]."

## 3. The "Markdown" Rule
Since the system handles Markdown specifically for bullet points, the AI needs to know the trigger:
> "To create a list, set `textFormat: 'markdown'` and prefix every line in the `content` string with '- '. Do NOT use numbers."

## 4. Shape Logic & Geometry
AI must understand that a 'shape' is essentially a styled container that can optionally hold text:
> "For `type: 'shape'`, the `content` property is for **TEXT INSIDE THE SHAPE**. If you just want a background decoration, set `content: ""`. To make a **CIRCLE**, set `borderRadius: 500`. To make a **SQUARE**, set `borderRadius: 0`."

## 5. Visual Weights
AI tends to put everything in the middle. Force it to use the "Rule of Thirds":
> "Balance the slide. If text is on the left (x: 50, width: 450), place a decorative shape or image on the right (x: 550, width: 400)."

## 6. Ingestion Blocks
When feeding user data, wrap it in specific delimiters to help the AI distinguish between *Instructions* and *Data*:
> "### USER SOURCE DATA ###
> {{readme_content}}
> ### END SOURCE DATA ###"
