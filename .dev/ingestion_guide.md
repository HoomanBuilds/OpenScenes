# Knowledge Ingestion Guide

This guide explains how to feed your project's code to the AI to get the best results without hitting token limits.

## 1. What to Ingest (The "Must-Reads")

| File Type | Purpose | Frequency |
| :--- | :--- | :--- |
| **`types.ts`** | The Source of Truth. AI needs this for every generation. | Every Session |
| **`Registry_*.tsx`** | Metadata only. Tell the AI what charts/shapes exist. | Once per Session |
| **`Dashboard.tsx`** | Only the `handleAddElement` / `handleGenerate` functions. | If changing logic |
| **`Sample.json`** | A reference of a "perfect" slide. | Every Generation |

## 2. Dealing with the "Registry"
Your "Director" agent needs to know what components you've actually built. Instead of feeding the whole `Registry.tsx` file (which might have heavy imports), create a **manifest.md** in `.dev/` that you automatically update:

```markdown
### Component Manifest
- IMAGE_RIGHT: Text on left, Image on right.
- CHART_BAR: Needs space-separated data.
- SHAPE_HERO: Background accent circle.
```

## 3. The "Director" vs "Creator" Ingestion
- **Director Ingestion**: User Context + Manifest. Goal: Pick the template.
- **Creator Ingestion**: Selected Template + `types.ts` + specific slide content. Goal: Polish the JSON.

## 4. What NOT to Ingest
- **CSS Files**: AI handles Tailwind classes via strings; it doesn't need to see the global CSS.
- **Node Modules / Imports**: Truncate these. AI only cares about the `return` statement and the `props`.
- **Large Assets**: Never feed raw base64 images to the context. Use placeholder URLs.
