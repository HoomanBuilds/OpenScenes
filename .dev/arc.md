# OpenScenes Video Pipeline — System Architecture

This document provides a detailed visual overview of the SaaS-level architecture for AI-driven video generation.

---

## 1. High-Level System Overview

```
┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                          OpenScenes VIDEO GENERATION PLATFORM                                    │
├───────────────────────┬───────────────────────────────────────────────────┬───────────────────────────────────┤
│       FRONTEND        │                  BACKEND (AI CORE)                │           OUTPUT LAYER            │
│      (Next.js)        │               (Node.js / FastAPI)                 │           (Remotion)              │
│                       │                                                   │                                   │
│   ┌─────────────┐     │     ┌────────────┐   ┌────────────┐   ┌────────┐ │     ┌───────────────────┐         │
│   │  Dashboard  │─────┼────▶│  Planner   │──▶│  Director  │──▶│Creator │─┼────▶│  Slide Renderer   │         │
│   │    (UI)     │     │     │   Agent    │   │   Agent    │   │ Agent  │ │     │   (React/Motion)  │         │
│   └─────────────┘     │     └────────────┘   └────────────┘   └────────┘ │     └─────────┬─────────┘         │
│          │            │           │                │               │     │               │                   │
│          │            │           ▼                ▼               ▼     │               ▼                   │
│          │            │     ┌────────────────────────────────────────┐   │     ┌───────────────────┐         │
│          │            │     │            Slide JSON (Array)          │   │     │   Video Encoder   │         │
│          │            │     │   [ {id, type, elements[], bg, ...} ]  │   │     │      (FFmpeg)     │         │
│          │            │     └────────────────────────────────────────┘   │     └─────────┬─────────┘         │
│          │            │                                                   │               │                   │
│          ▼            │                                                   │               ▼                   │
│   ┌─────────────┐     │                                                   │     ┌───────────────────┐         │
│   │   Editor    │     │                                                   │     │    MP4 / WEBM     │         │
│   │ (Realtime)  │     │                                                   │     │     Download      │         │
│   └─────────────┘     │                                                   │     └───────────────────┘         │
└───────────────────────┴───────────────────────────────────────────────────┴───────────────────────────────────┘
```

---

## 2. AI Agent Pipeline (Waterfall Refinement)

The core intelligence is split into three specialized agents. This improves reliability and allows targeted prompting.

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                      AGENTIC GENERATION FLOW                                        │
│                                                                                                     │
│  [User Input]                                                                                       │
│       │                                                                                             │
│       ▼                                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  STAGE 1: PLANNER AGENT  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │   │
│  │                                                                                              │   │
│  │  INPUT: Raw user prompt, README text, URL content                                            │   │
│  │  ROLE:  Narrative Arc & High-Level Theme Selection                                           │   │
│  │  OUTPUT:                                                                                     │   │
│  │    {                                                                                         │   │
│  │      "theme": "Cyberpunk SaaS",                                                              │   │
│  │      "arc": ["Hook", "Problem", "Solution", "Result", "CTA"],                                │   │
│  │      "slides": [                                                                             │   │
│  │        { "intent": "title", "keyPoints": ["Product Name", "Tagline"] },                      │   │
│  │        { "intent": "features", "keyPoints": ["Speed", "Scale", "Security"] },                │   │
│  │        ...                                                                                   │   │
│  │      ]                                                                                       │   │
│  │    }                                                                                         │   │
│  └────────────────────────────────────────────────────────────────────────────────────────┬─────┘   │
│                                                                                           │         │
│                                                                                           ▼         │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  STAGE 2: DIRECTOR AGENT  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │   │
│  │                                                                                              │   │
│  │  INPUT: Storyboard JSON + Component Manifest (names/descriptions)                            │   │
│  │  ROLE:  Layout Selection & Asset Discovery                                                   │   │
│  │  OUTPUT:                                                                                     │   │
│  │    {                                                                                         │   │
│  │      "slides": [                                                                             │   │
│  │        { "idx": 0, "layoutType": "TITLE_CARD", "assets": [] },                               │   │
│  │        { "idx": 1, "layoutType": "FEATURES_GRID", "assets": ["icon:rocket", "icon:cloud"] }, │   │
│  │        { "idx": 2, "layoutType": "CHART_BAR", "assets": [] },                                │   │
│  │        ...                                                                                   │   │
│  │      ]                                                                                       │   │
│  │    }                                                                                         │   │
│  └────────────────────────────────────────────────────────────────────────────────────────┬─────┘   │
│                                                                                           │         │
│                                                                                           ▼         │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  STAGE 3: CREATOR AGENT  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │   │
│  │                                                                                              │   │
│  │  INPUT: Structural Map + types.ts + Golden Example JSON                                      │   │
│  │  ROLE:  Precise Coordinate & Style JSON Generation                                          │   │
│  │  OUTPUT:                                                                                     │   │
│  │    [                                                                                         │   │
│  │      {                                                                                       │   │
│  │        "id": "slide-1", "type": "title", "duration": 150,                                    │   │
│  │        "background": { "type": "color", "value": "#18181b" },                                │   │
│  │        "elements": [                                                                         │   │
│  │          { "id": "h1", "type": "headline", "x": 50, "y": 200, ... },                         │   │
│  │          ...                                                                                 │   │
│  │        ]                                                                                     │   │
│  │      },                                                                                      │   │
│  │      ...                                                                                     │   │
│  │    ]                                                                                         │   │
│  └──────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Data Flow: Ingestion to Render

```
┌────────────────────────────┐      ┌────────────────────────────┐      ┌────────────────────────────┐
│      USER INPUTS           │      │       AI PROCESSING        │      │       FRONTEND STATE       │
│                            │      │                            │      │                            │
│  ● Prompt (Text)           │      │  ● LLM API (GPT-4 / Gemini)│      │  ● slides: Slide[]         │
│  ● Context Files (.md,.csv)│─────▶│  ● Prompt Templates        │─────▶│  ● globalAssets: Asset[]   │
│  ● Visual Style (Dropdown) │      │  ● JSON Schema Validation  │      │  ● selectedSlideId         │
│  ● Asset Uploads           │      │                            │      │                            │
└────────────────────────────┘      └────────────────────────────┘      └─────────────┬──────────────┘
                                                                                       │
                                                                                       ▼
                                    ┌──────────────────────────────────────────────────────────────┐
                                    │                      RENDERING ENGINE                        │
                                    │                                                              │
                                    │  ┌────────────────┐    ┌────────────────┐    ┌────────────┐  │
                                    │  │ SlidePreview   │    │ Interactive    │    │ Remotion   │  │
                                    │  │ (Dashboard)    │    │ Editor (Focus) │    │ Composition│  │
                                    │  └───────┬────────┘    └───────┬────────┘    └─────┬──────┘  │
                                    │          │                     │                   │         │
                                    │          └─────────────────────┴───────────────────┘         │
                                    │                                │                             │
                                    │                          common render logic                 │
                                    │                          (ElementRenderer.tsx)               │
                                    └──────────────────────────────────────────────────────────────┘
```

---

## 4. Component Hierarchy

```
                                        Dashboard.tsx
                                             │
                       ┌─────────────────────┼─────────────────────┐
                       │                     │                     │
                       ▼                     ▼                     ▼
                 LeftPanel.tsx         RightPanel.tsx         (State: slides[])
                       │                     │
         ┌─────────────┼─────────────┐       │
         │             │             │       │
         ▼             ▼             ▼       │
  LeftPanel_     LeftPanel_    LeftPanel_    │
  Global.tsx     Assets.tsx    SlideSettings │
                                             │
                               ┌─────────────┼─────────────┐
                               │             │             │
                               ▼             ▼             ▼
                       SlideSequence   Interactive     (Remotion
                          .tsx        SlidePreview      Optional)
                               │             │
                               ▼             ▼
                       SlidePreview    DraggableElement
                          .tsx             .tsx
                               │             │
                               └──────┬──────┘
                                      ▼
                            ElementRenderer.tsx
                            (headline, text, shape, chart, image, video)
```

---

## 5. State Synchronization Model

```
                 ┌──────────────────────────────────────────────────────────────┐
                 │                         Dashboard State                      │
                 │                                                              │
  ┌──────────────┼───────────────────────────────────────────────────────────┐  │
  │              │  slides: Slide[]                                          │  │
  │              │    ├── id: string                                         │  │
  │              │    ├── type: "title" | "features" | ...                   │  │
  │              │    ├── duration: number (frames)                          │  │
  │              │    ├── background: { type, value, props }                 │  │
  │              │    └── elements: SlideElement[]                           │  │
  │              │          ├── id, type, content                            │  │
  │              │          ├── x, y, width, height                          │  │
  │              │          ├── fontSize, fontWeight, color, textColor       │  │
  │              │          ├── opacity, zIndex, rotation                    │  │
  │              │          ├── animation: { type, duration, delay, ... }    │  │
  │              │          └── chartProps / borderRadius / strokeWidth ...  │  │
  └──────────────┼───────────────────────────────────────────────────────────┘  │
                 │                                                              │
                 │  globalAssets: Asset[]       selectedSlideId: string | null  │
                 │  selectedElementIds: string[]   viewMode: 'sequence'|'focus' │
                 │  history: Slide[][]   (Undo stack, max 20)                   │
                 └──────────────────────────────────────────────────────────────┘
```

---

## 6. JSON Template Schema (Slide Definition)

This is the contract between the AI and the Frontend. All generated slides must adhere to this structure.

```json
{
  "name": "TemplateName",
  "slides": [
    {
      "id": "slide-1",
      "type": "title",
      "duration": 150,
      "background": { "type": "color", "value": "#18181b" },
      "elements": [
        {
          "id": "el-headline",
          "type": "headline",
          "content": "Hello World",
          "x": 100, "y": 200,
          "width": 800, "height": 80,
          "fontSize": 60, "fontWeight": "bold", "textColor": "#ffffff",
          "textAlign": "center", "verticalAlign": "center",
          "zIndex": 2, "opacity": 1, "rotation": 0,
          "animation": { "type": "pop", "duration": 0.8, "delay": 0.2 }
        }
      ]
    }
  ]
}
```

---

## 7. Recommended Deployment Architecture (Production)

```
┌───────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                         CLOUD INFRASTRUCTURE                                      │
│                                                                                                   │
│   ┌───────────────┐      ┌────────────────┐      ┌────────────────┐      ┌────────────────────┐   │
│   │   Vercel /    │      │    API Layer   │      │   AI Agents    │      │   Object Storage   │   │
│   │   Netlify     │─────▶│  (Next.js API  │─────▶│   (Serverless  │─────▶│   (S3 / R2 /       │   │
│   │   (Frontend)  │      │   Routes)      │      │    Workers)    │      │    Supabase)       │   │
│   └───────────────┘      └───────┬────────┘      └───────┬────────┘      └─────────┬──────────┘   │
│                                  │                       │                         │              │
│                                  │                       ▼                         │              │
│                                  │            ┌──────────────────────┐             │              │
│                                  │            │  LLM Provider        │             │              │
│                                  │            │  (OpenAI / Gemini /  │             │              │
│                                  │            │   Anthropic)         │             │              │
│                                  │            └──────────────────────┘             │              │
│                                  │                                                 │              │
│                                  ▼                                                 ▼              │
│                      ┌─────────────────────────────────────────────────────────────────────┐      │
│                      │                      Render Farm (Optional)                         │      │
│                      │   ┌──────────────┐   ┌──────────────┐   ┌──────────────────────┐    │      │
│                      │   │  Remotion    │   │  FFmpeg      │   │  Queue (BullMQ /     │    │      │
│                      │   │  Lambda      │──▶│  Encoder     │──▶│  Redis / Inngest)    │    │      │
│                      │   └──────────────┘   └──────────────┘   └──────────────────────┘    │      │
│                      └─────────────────────────────────────────────────────────────────────┘      │
│                                                                                                   │
└───────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Security Considerations

| Concern               | Mitigation                                                  |
| :-------------------- | :---------------------------------------------------------- |
| Prompt Injection      | Sanitize user input; use delimiters for data blocks.        |
| LLM Output Validation | Parse JSON strictly; reject malformed or dangerous payloads.|
| Asset Abuse           | 2MB upload limit; validate MIME types server-side.          |
| Rate Limiting         | Implement per-user/per-IP generation limits.                |
| Content Moderation    | Optional NSFW/content filter before rendering.              |

---

## 9. Future Enhancements

- [ ] **Real-time Collaboration**: Multiplayer editing via CRDTs (Yjs/Liveblocks).
- [ ] **Version History**: Git-like revisions for slide decks.
- [ ] **Custom Branding**: User-uploaded fonts, logos, and color palettes.
- [ ] **Template Marketplace**: Community-shared and monetized slide schemas.
- [ ] **Voice-Over Integration**: TTS sync with slide durations.

