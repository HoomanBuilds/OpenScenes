<div align="center">

# 🎬 OpenScenes

### AI-Powered Video Presentation Engine

*Transform ideas into stunning video presentations with AI-driven generation and professional rendering.*

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Remotion](https://img.shields.io/badge/Remotion-4.0-purple?style=for-the-badge)](https://remotion.dev/)
[![Google AI](https://img.shields.io/badge/Gemini-AI-orange?style=for-the-badge&logo=google)](https://ai.google.dev/)

![Dashboard Preview](/.github/assets/dashboard.png)

</div>

---

## ✨ Features

- 🧠 **AI Generation** — Multi-agent pipeline transforms prompts into complete presentations
- ✏️ **Intelligent Editing** — Natural language editing at global, slide, and element levels
- 🎥 **Video Export** — Distributed render engine with Remotion
- 🎨 **Theme Engine** — 10+ curated visual themes with AI-aware styling
- 📁 **File Context** — Upload documents (PDF, MD, CSV) for AI-informed generation
- ⚡ **Real-time Preview** — Interactive canvas with drag-and-drop editing

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | Next.js 15, React 19, TypeScript, Framer Motion |
| **AI** | Google Gemini 2.0, Vertex AI (Imagen 3) |
| **Video** | Remotion 4, WebCodecs API |
| **Infrastructure** | RabbitMQ, Redis, PostgreSQL, MinIO (S3) |
| **DevOps** | Docker, Docker Compose |

---

## ✏️ Tiered Edit System

Natural language editing at three granularity levels:

```mermaid
flowchart LR
    subgraph "Edit Levels"
        L1["🌍 Global<br/>All slides"]
        L2["📄 Slide<br/>Single slide"]
        L3["🔲 Element<br/>Selected items"]
    end
    
    L1 --> Classifier
    L2 --> Classifier
    L3 --> Classifier
    
    Classifier[AI Classifier] --> Patches[JSON Patches]
    Patches --> Apply[Deep Merge]
    Apply --> Result[Updated Slides]
```

**Examples:**
- 🌍 *"Make all headlines use brand color #6366f1"*
- 📄 *"Convert this slide to a two-column comparison"*
- 🔲 *"Make the selected text larger and bold"*

---

## 🏗️ Architecture

```mermaid
graph TB
    subgraph Frontend
        UI[Next.js App]
    end
    
    subgraph Workers
        AI[AI Worker]
        Render[Render Worker]
    end
    
    subgraph Infrastructure
        RMQ[(RabbitMQ)]
        Redis[(Redis)]
        PG[(PostgreSQL)]
        S3[(MinIO)]
    end
    
    subgraph External
        Gemini[Google Gemini]
    end
    
    UI --> RMQ
    RMQ --> AI
    RMQ --> Render
    AI --> Gemini
    AI --> S3
    Render --> S3
```

### ⚡ Event-Driven Architecture

The system uses a **distributed, event-driven architecture** for scalable async processing:

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Message Queue** | RabbitMQ | Decouples API from workers, enables horizontal scaling |
| **Job Status** | Redis | Real-time status polling, pub/sub for cancellation |
| **Workers** | Node.js | Stateless consumers that process AI/render jobs |
| **Storage** | MinIO (S3) | Object storage for assets and rendered videos |

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant RabbitMQ
    participant Worker
    participant Redis
    
    Client->>API: POST /api/ai/generate
    API->>RabbitMQ: Publish job
    API->>Redis: Set status: queued
    API-->>Client: { jobId }
    
    RabbitMQ->>Worker: Consume job
    Worker->>Redis: Update: processing
    Worker->>Worker: Execute AI pipeline
    Worker->>Redis: Update: completed
    
    Client->>API: GET /api/ai/status/{jobId}
    API->>Redis: Get status
    API-->>Client: { status, result }
```

---

## 🧠 AI Pipeline

```mermaid
flowchart LR
    Query[User Query] --> Summarizer
    Summarizer --> Director
    Director --> Assets[Asset Generator]
    Director --> Slides[Slide Generator]
    Assets --> Integration
    Slides --> Integration
    Integration --> Validator
    Validator --> Output[Final Slides]
```

| Agent | Model | Purpose |
|-------|-------|---------|
| **Summarizer** | Gemini Flash Lite | Extract intent and key points |
| **Director** | Gemini Flash | Plan narrative and visual style |
| **Slide Generator** | Gemini Flash | Generate slide JSON |

---

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/ai/            # AI endpoints
│   ├── api/render/        # Render endpoints
│   └── generate/          # Dashboard & editor
├── worker/
│   ├── ai/                # AI generation worker
│   └── render/            # Video render worker
├── remotion/              # Video composition
└── docker-compose.yml     # Full stack setup
```

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start infrastructure
docker-compose up -d

# Setup environment
cp .env.example .env.local

# Setup Google Cloud Credentials (required for Vertex AI)
# Place your service-account.json in the root directory
# OR set GOOGLE_APPLICATION_CREDENTIALS in .env to your local path

# Run development server
npm run dev

# Run workers (separate terminals)
npm run worker:ai
npm run worker:render
```

---

## 📊 Editor

![Editor View](/.github/assets/editor.png)

---

## 📖 Documentation

- [API Reference](docs/API.md)
- [AI Worker](worker/ai/README.md)
- [Render Worker](worker/render/README.md)

---

<div align="center">

** Built with Next.js, Remotion, and Google Gemini**

</div>
