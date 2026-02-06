# Render Worker

Distributed video rendering engine using Remotion and FFmpeg.

## Architecture

```mermaid
graph TD
    subgraph "Entry Point"
        Consumer[RabbitMQ Consumer]
    end
    
    subgraph "Concurrency Control"
        Pool[Worker Pool]
        Semaphore[Semaphore<br/><small>RENDER_CONCURRENCY</small>]
    end
    
    Consumer --> Pool
    Pool --> Semaphore
    
    subgraph "Render Pipeline"
        Semaphore --> Bundle[Remotion Bundler]
        Bundle --> Render[Frame Renderer]
        Render --> Stitch[FFmpeg Stitcher]
    end
    
    subgraph "Progress Reporting"
        Render --> Progress[Progress Reporter]
        Progress --> Redis[(Redis)]
        Progress --> CLI[CLI Progress Bars]
    end
    
    subgraph "Output"
        Stitch --> Upload[S3 Upload]
        Upload --> Notify[Job Complete]
        Notify --> Redis
    end
    
    subgraph "Cancellation"
        Redis --> |cancel signal| CancelHandler[Cancel Handler]
        CancelHandler --> |abort| Render
    end
```

## Rendering Flow

```mermaid
sequenceDiagram
    participant Queue as RabbitMQ
    participant Worker as Render Worker
    participant Remotion
    participant FFmpeg
    participant S3 as MinIO
    participant Redis
    
    Queue->>Worker: Render Job Message
    Worker->>Redis: Status: processing
    
    rect rgb(240, 248, 255)
        Note over Worker,Remotion: Bundle Phase
        Worker->>Remotion: bundle(composition)
        Remotion-->>Worker: Bundle URL
    end
    
    rect rgb(240, 255, 240)
        Note over Worker,Remotion: Render Phase
        loop Each Frame
            Worker->>Remotion: renderFrame(n)
            Remotion-->>Worker: Frame PNG
            Worker->>Redis: Progress update
        end
    end
    
    rect rgb(255, 248, 240)
        Note over Worker,FFmpeg: Encode Phase
        Worker->>FFmpeg: Stitch frames
        FFmpeg-->>Worker: video.mp4
    end
    
    Worker->>S3: Upload video
    Worker->>Redis: Status: completed
    Worker->>Queue: Acknowledge
```

## Concurrency Model

```mermaid
flowchart TB
    subgraph "Worker Process"
        Main[Main Thread]
        
        subgraph "Worker Pool (N workers)"
            W1[Worker 1]
            W2[Worker 2]
            W3[Worker N...]
        end
        
        Main --> W1
        Main --> W2
        Main --> W3
    end
    
    subgraph "Jobs Queue"
        J1[Job 1]
        J2[Job 2]
        J3[Job 3]
        J4[Job 4...]
    end
    
    J1 --> W1
    J2 --> W2
    J3 --> W3
    J4 -.-> |waiting| Main
    
    style W1 fill:#dcfce7
    style W2 fill:#dcfce7
    style W3 fill:#e0f2fe
```

## Real-Time Cancellation

```mermaid
sequenceDiagram
    participant API as API Server
    participant Redis as Redis Pub/Sub
    participant Worker as Render Worker
    participant Process as Render Process
    
    Note over Worker: Subscribed to cancellation channel
    
    API->>Redis: PUBLISH cancel:{jobId}
    Redis->>Worker: Cancel signal
    Worker->>Process: Abort render
    Process-->>Worker: Aborted
    Worker->>Redis: Status: cancelled
```

## Progress UI

The worker uses `cli-progress` for real-time terminal visualization:

```
Render Jobs [████████░░░░░░░░░░░░] 2/5 jobs | Active: 3
┌─ Job render_abc123 ─────────────────────────────────────────┐
│ [████████████████████████░░░░░░░░░░░░░░] 65% | Encoding     │
└─────────────────────────────────────────────────────────────┘
┌─ Job render_def456 ─────────────────────────────────────────┐
│ [███████████░░░░░░░░░░░░░░░░░░░░░░░░░░░] 28% | Rendering    │
└─────────────────────────────────────────────────────────────┘
```

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `RABBITMQ_URL` | - | RabbitMQ connection |
| `REDIS_URL` | - | Status & cancellation |
| `S3_ENDPOINT` | - | MinIO/S3 endpoint |
| `S3_BUCKET` | `renders` | Output bucket |
| `RENDER_CONCURRENCY` | `2` | Parallel render jobs |
| `REMOTION_CHROME_PATH` | auto | Chromium path |

## Job Message Format

```json
{
  "jobId": "render_1234567890",
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

## Resolution Presets

| Preset | Dimensions | Use Case |
|--------|------------|----------|
| `720p` | 1280×720 | Fast preview |
| `1080p` | 1920×1080 | Standard |
| `4k` | 3840×2160 | High quality |

## Quality Settings

| Quality | CRF | Description |
|---------|-----|-------------|
| `low` | 28 | Fast, smaller files |
| `medium` | 23 | Balanced |
| `high` | 18 | Better quality |
| `ultra` | 15 | Maximum quality |

## Docker Deployment

```dockerfile
FROM node:20-slim

# Install FFmpeg and Chromium
RUN apt-get update && apt-get install -y \
    ffmpeg \
    chromium \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .
RUN npm ci --production

ENV REMOTION_CHROME_PATH=/usr/bin/chromium

CMD ["npm", "run", "worker:render"]
```

## Running

```bash
# Development
npm run worker:render

# With custom concurrency
RENDER_CONCURRENCY=4 npm run worker:render

# Production (Docker)
docker-compose up render-worker
```

## Monitoring

Check worker health via Redis:
```bash
redis-cli KEYS "render:*"
redis-cli GET "render:job_123:status"
redis-cli GET "render:job_123:progress"
```
