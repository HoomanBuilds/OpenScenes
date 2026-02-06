# API Documentation

Comprehensive API reference for OpenScenes.

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

---

## 🧠 AI Endpoints

### Generate Presentation

Creates a new presentation from a prompt.

```http
POST /api/ai/generate
```

**Request Body:**
```json
{
  "userQuery": "Create a pitch deck about AI in healthcare",
  "themeName": "dark_modern",
  "requestedSlideCount": 6,
  "rawFiles": [
    {
      "fileName": "research.pdf",
      "content": "...",
      "charCount": 5000
    }
  ]
}
```

**Response:**
```json
{
  "jobId": "ai_1707123456789_abc123",
  "statusUrl": "/api/ai/status/ai_1707123456789_abc123"
}
```

---

### Edit Presentation (Global)

Edit all slides with a natural language instruction.

```http
POST /api/ai/edit
```

**Request Body:**
```json
{
  "slides": [...],
  "instruction": "Make all headlines blue and add subtle animations",
  "themeName": "dark_modern",
  "metadata": {
    "summary": "A pitch deck about AI healthcare solutions"
  }
}
```

**Response:**
```json
{
  "jobId": "ai_edit_1707123456789",
  "statusUrl": "/api/ai/status/ai_edit_1707123456789"
}
```

---

### Edit Slide

Edit a single slide.

```http
POST /api/ai/edit/slide
```

**Request Body:**
```json
{
  "slideId": "slide-3",
  "slide": { /* full slide JSON */ },
  "instruction": "Convert to a comparison layout with two columns",
  "themeName": "dark_modern",
  "projectSummary": "AI healthcare pitch deck"
}
```

**Response:**
```json
{
  "jobId": "ai_slide_1707123456789",
  "statusUrl": "/api/ai/status/ai_slide_1707123456789"
}
```

---

### Edit Elements

Edit selected elements on a slide.

```http
POST /api/ai/edit/element
```

**Request Body:**
```json
{
  "slideId": "slide-3",
  "elements": [
    { "id": "headline-1", "type": "headline", "content": "..." }
  ],
  "instruction": "Make text larger and change color to red",
  "themeName": "dark_modern"
}
```

**Response:**
```json
{
  "jobId": "ai_element_1707123456789",
  "statusUrl": "/api/ai/status/ai_element_1707123456789"
}
```

---

### Poll Job Status

Check the status of an AI job.

```http
GET /api/ai/status/{jobId}
```

**Response (Processing):**
```json
{
  "status": "processing",
  "progress": 45,
  "phase": "Generating slides..."
}
```

**Response (Completed):**
```json
{
  "status": "completed",
  "result": {
    "slides": [...],
    "summary": "Generated 6 slides"
  }
}
```

**Response (Failed):**
```json
{
  "status": "failed",
  "error": "Rate limit exceeded"
}
```

---

## 🎥 Render Endpoints

### Start Render

Start a video render job.

```http
POST /api/render
```

**Request Body:**
```json
{
  "templateData": {
    "slides": [...],
    "totalDuration": 450
  },
  "options": {
    "fps": 30,
    "scale": 1,
    "format": "mp4",
    "quality": "high",
    "resolution": "1080p"
  }
}
```

**Response:**
```json
{
  "success": true,
  "jobId": "render_1707123456789",
  "statusUrl": "/api/render/status/render_1707123456789"
}
```

---

### Cancel Render

Cancel an in-progress render.

```http
POST /api/render/cancel
```

**Request Body:**
```json
{
  "jobId": "render_1707123456789"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Render cancelled"
}
```

---

### Poll Render Status

Check render job progress.

```http
GET /api/render/status/{jobId}
```

**Response:**
```json
{
  "status": "rendering",
  "progress": 72,
  "phase": "Encoding video"
}
```

---

### Stream Video

Get the rendered video file.

```http
GET /api/video/{jobId}
```

**Response:** Video file stream (MP4/WebM)

**Headers:**
```
Content-Type: video/mp4
Content-Disposition: attachment; filename="presentation.mp4"
```

---

## 📊 Data Types

### Slide

```typescript
interface Slide {
  id: string;
  type: 'title' | 'content' | 'features' | 'comparison' | 'custom';
  duration: number; // frames at 30fps
  background: SlideBackground;
  elements: SlideElement[];
}
```

### SlideElement

```typescript
interface SlideElement {
  id: string;
  type: 'headline' | 'text' | 'image' | 'shape' | 'chart' | 'custom';
  content?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  fontWeight?: string;
  textColor?: string;
  opacity?: number;
  rotation?: number;
  animation?: Animation;
}
```

### Animation

```typescript
interface Animation {
  type: 'fade' | 'slide' | 'pop' | 'typewriter' | 'none';
  duration: number;
  delay: number;
  easing?: string;
}
```

---

## 🔒 Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `RATE_LIMIT` | 429 | Too many requests |
| `INVALID_INPUT` | 400 | Malformed request |
| `JOB_NOT_FOUND` | 404 | Job ID doesn't exist |
| `PROCESSING_ERROR` | 500 | AI/Render failure |
| `UNAUTHORIZED` | 401 | Missing/invalid auth |

---

## 📈 Rate Limits

| Endpoint | Limit |
|----------|-------|
| `/api/ai/generate` | 10/hour |
| `/api/ai/edit*` | 30/hour |
| `/api/render` | 5/hour |
| `/api/ai/status/*` | 120/min |
