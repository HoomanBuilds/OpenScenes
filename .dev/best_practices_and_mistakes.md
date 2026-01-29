# Backend Best Practices & Pitfalls

## ❌ Common Mistakes to Avoid

1. **Hallucinating Properties**: The AI will try to use `font: "Arial"` or `size: 20`. 
    - **Fix**: Always provide the `types.ts` interface and tell the AI: "If a property is not in this interface, DO NOT USE IT."
2. **Coordinate Overflow**: Placing elements at `x: 1200` on a 1000px canvas.
    - **Fix**: Remind the AI of the Viewport Bounds in every "Creator" call.
3. **Z-Index Collision**: Putting text (zIndex 1) behind a background image (zIndex 10).
    - **Fix**: Define standard layers: Background (0-5), Decoration (6-9), Content (10-20), Overlays (21+).
4. **Broken Chart Strings**: Formatting chart data as `[1, 2, 3]` instead of `"Label 1 2 3"`.
    - **Fix**: Provide a regex or string example for every complex data type.

## ✅ High-Performance Practices

1. **Template "Hot-Loading"**: 
    - Don't ask the AI to write a slide from scratch every time. 
    - Give it a "Stencil" (a JSON slide with x, y, width, height pre-calculated) and ask it only to fill the `content` and `textColor`.
2. **Color Palette Injection**:
    - Instead of "choose good colors," provide a pre-defined array: `const THEME_COLORS = ['#18181b', '#9333ea', '#ffffff']`. 
    - Tell the AI: "Pick colors only from this list."
3. **Token Conservation**:
    - The "Director" agent doesn't need to see the full code. It only needs a list of component names and what they look like (descriptions).
4. **Validation Layer**:
    - Always pass the generated JSON through a simple Zod or Joi validator before sending it to the frontend. If it fails, send the error back to the AI for a "One-shot Fix."
