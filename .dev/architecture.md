# AI Agentic Architecture: Video Generation Pipeline

This document outlines the multi-agent strategy for transforming raw user input (READMEs, Prompts) into production-ready slide JSONs.

## 1. Multi-Agent Flow

We use a "Waterfall Refinement" strategy with three specialized agents:

### A. The Planner (The Strategist)
- **Input**: User Prompt, README content, or Website URL.
- **Role**: High-level narrative design.
- **Output**: A **Storyboard JSON** which defines:
    - Overall Theme (e.g., "Cyberpunk", "Minimalist SaaS").
    - Narrative flow (e.g., Hook -> Problem -> Solution -> Growth -> CTA).
    - Content for each slide (Key points, not layout).

### B. The Director (The Architect)
- **Input**: Storyboard JSON + Component Registry (Template metadata).
- **Role**: Layout & Tool selection.
- **Output**: A **Structural Map**.
    - Chooses which *Template Type* fits each slide (e.g., "Slide 2 needs a Comparison Layout").
    - Determines which assets (Icons/Images) are needed.
    - Does NOT do the final color/pixel math yet.

### C. The Creator (The Painter)
- **Input**: Structural Map + `types.ts`.
- **Role**: Precise JSON Generation.
- **Output**: Final **SlideElement[]** JSON.
    - Handles coordinates (1000x562 scale).
    - Applies the "Visual Style" (Hex codes, Font weights).
    - Formats Content (Markdown bullets, Chart data strings).

## 2. Ingestion Strategy

To keep the context clean, do not inject everything at once. Use "Just-In-Time" ingestion:

1. **Step 1**: Feed the **Planner** only the User Context.
2. **Step 2**: Feed the **Director** the Registry of available components (names/descriptions only).
3. **Step 3**: Feed the **Creator** the full `types.ts` and the "Golden Example" slides.

## 3. Iterative Generation vs Batch
- **Batch**: Fast, but high error rate.
- **Iterative (Recommended)**: Generate Slide 1 -> Validate -> Generate Slide 2. This allows the AI to "learn" from the visual weight of Slide 1 to keep Slide 2 consistent.
