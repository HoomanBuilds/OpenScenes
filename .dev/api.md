# API Reference

## AI

### Generate
`POST /api/ai/generate`
```json
{
  "userQuery": "Create a pitch deck about AI",
  "themeName": "dark_modern",
  "requestedSlideCount": 6
}
```
**Response**: `{ jobId, statusUrl }`

---

### Edit (Global)
`POST /api/ai/edit`
```json
{
  "slides": [...],
  "instruction": "Make all headlines blue",
  "themeName": "dark_modern",
  "metadata": { "summary": "..." }
}
```
**Response**: `{ jobId, statusUrl }`

---

### Edit (Slide)
`POST /api/ai/edit/slide`
```json
{
  "slideId": "slide-1",
  "slide": { /* full slide JSON */ },
  "instruction": "Convert to glassmorphism layout",
  "themeName": "dark_modern",
  "projectSummary": "..."
}
```
**Response**: `{ jobId, statusUrl }`

---

### Edit (Element)
`POST /api/ai/edit/element`
```json
{
  "slideId": "slide-1",
  "elements": [{ "id": "headline-1", "type": "headline", ... }],
  "instruction": "Make text color red",
  "themeName": "dark_modern"
}
```
**Response**: `{ jobId, statusUrl }`

---

### Status
`GET /api/ai/status/{jobId}`
```json
{
  "status": "completed" | "processing" | "failed",
  "result": { "slides": [...] }
}
```

---

## Render

### Start Render
`POST /api/render`
```json
{
  "templateData": { "slides": [...] },
  "fps": 30,
  "scale": 1,
  "format": "mp4",
  "quality": "high"
}
```
**Response**: `{ jobId, statusUrl }`

---

### Cancel Render
`POST /api/render/cancel`
```json
{ "jobId": "render_xxx" }
```

---

### Project Render
`POST /api/render/project`
```json
{ "projectId": "xxx" }
```

---

## Video

### Stream Video
`GET /api/video/{jobId}`

Returns video file stream.
