# AI Worker

The AI Worker handles all AI-powered generation and editing tasks for presentations.

## Architecture

```mermaid
graph TD
    subgraph "Entry Point"
        Consumer[RabbitMQ Consumer]
    end
    
    subgraph "Job Router"
        Router{Job Type?}
    end
    
    Consumer --> Router
    
    Router --> |generate| GenPipeline[Generation Pipeline]
    Router --> |edit| EditPipeline[Edit Pipeline]
    Router --> |edit_slide| SlidePipeline[Slide Edit Pipeline]
    Router --> |edit_element| ElementPipeline[Element Edit Pipeline]
    
    subgraph "Generation Pipeline"
        GenPipeline --> Summarizer
        Summarizer --> Director
        Director --> AssetGen[Asset Generator]
        Director --> SlideGen[Slide Generator]
        AssetGen --> Integration
        SlideGen --> Integration
        Integration --> Validator
    end
    
    subgraph "Edit Pipelines"
        EditPipeline --> Classifier[Scope Classifier]
        Classifier --> PatchGen[Patch Generator]
        
        SlidePipeline --> SlideEditor[Slide Editor]
        ElementPipeline --> ElementEditor[Element Editor]
    end
    
    subgraph "Output"
        Validator --> Result[(Redis Result)]
        PatchGen --> Apply[Apply Patches]
        SlideEditor --> Apply
        ElementEditor --> Apply
        Apply --> Result
    end
    
    style Summarizer fill:#e0f2fe
    style Director fill:#fef3c7
    style SlideGen fill:#dcfce7
    style Validator fill:#f3e8ff
```

## Pipeline Stages

### 1. Summarizer
```mermaid
flowchart LR
    Input["User Query<br/>+ Files"] --> Parse[Parse & Extract]
    Parse --> LLM["Gemini Flash Lite"]
    LLM --> Summary["Structured Summary<br/>• Topic<br/>• Intent<br/>• Key Points"]
```

**Model:** `gemini-2.0-flash-lite`  
**Purpose:** Distills complex content into actionable summary

### 2. Director
```mermaid
flowchart LR
    Summary --> Theme[Theme Context]
    Theme --> LLM["Gemini Flash"]
    LLM --> Plan["Director Plan<br/>• Narrative Arc<br/>• Slide Types<br/>• Asset Directives<br/>• Scene Batches"]
```

**Model:** `gemini-2.0-flash`  
**Purpose:** Creative planning - decides structure and visual strategy

### 3. Asset Generator
```mermaid
flowchart TD
    Directive[Asset Directive] --> Router{Mode?}
    
    Router --> |stock| StockRegistry
    Router --> |ai| ImagenPrompt
    
    subgraph "Stock Mode"
        StockRegistry[Stock Registry] --> CDN[Unsplash CDN]
    end
    
    subgraph "AI Mode"
        ImagenPrompt[Generate Prompt] --> Imagen["Imagen 3<br/><small>Vertex AI</small>"]
        Imagen --> Upload[Upload to S3]
    end
    
    CDN --> AssetMap
    Upload --> AssetMap
    AssetMap["Asset Map<br/>{id: url}"]
```

### 4. Slide Generator
```mermaid
flowchart LR
    ScenePlan[Scene Plan] --> Context[Theme + Schema]
    Context --> LLM["Gemini Flash"]
    LLM --> JSON["Slide JSON<br/>• Elements<br/>• Positions<br/>• Animations"]
```

**Model:** `gemini-2.0-flash`  
**Purpose:** Writes structured JSON for each slide

### 5. Validator
```mermaid
flowchart LR
    Slides[Raw Slides] --> Schema{Schema Valid?}
    Schema --> |yes| Output[Final Slides]
    Schema --> |no| AutoFix[Auto-Fix]
    AutoFix --> Retry{Retry?}
    Retry --> |yes| Schema
    Retry --> |max retries| Error[Error Response]
```

## Edit Pipeline Details

### Global Edit Flow
```mermaid
sequenceDiagram
    participant API
    participant Classifier
    participant PatchGen
    participant Apply
    
    API->>Classifier: instruction + all slides
    Classifier->>Classifier: Determine scope
    
    alt Global Scope
        Classifier->>PatchGen: Full slides + summaries
    else Local Scope
        Classifier->>PatchGen: Target slides only
    end
    
    PatchGen->>PatchGen: Generate JSONPatch[]
    PatchGen->>Apply: Patches
    Apply->>Apply: Deep merge
    Apply-->>API: Updated slides
```

### Slide Edit Flow
```mermaid
flowchart LR
    Input["Slide + Instruction"] --> Mode{Mode?}
    
    Mode --> |PATCH| Patcher["Patch Generator<br/><small>Fast, targeted</small>"]
    Mode --> |REGENERATE| Regenerator["Full Regeneration<br/><small>Complete redesign</small>"]
    
    Patcher --> Apply[Apply Patches]
    Regenerator --> Replace[Replace Slide]
    
    Apply --> Output[Updated Slide]
    Replace --> Output
```

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `RABBITMQ_URL` | - | RabbitMQ connection string |
| `REDIS_URL` | - | Redis for job status |
| `AI_MODEL_GENERATION` | `gemini-2.0-flash` | Main generation model |
| `AI_MODEL_CHEAP` | `gemini-2.0-flash-lite` | Summarizer/classifier |
| `DEBUG_LOG` | `false` | Enable detailed logging |

## Job Message Format

```json
{
  "jobId": "ai_1234567890",
  "operation": "generate" | "edit" | "edit_slide" | "edit_element",
  "payload": {
    "userQuery": "...",
    "themeName": "dark_modern",
    "slides": [...],
    "instruction": "..."
  }
}
```

## Logging

When `DEBUG_LOG=true`, detailed logs are written to:
```
logs/ai-logs/{jobId}/
├── prompt.json      # Full LLM prompts
├── response.json    # Raw responses
└── result.json      # Final output
```

## Running

```bash
# Development
npm run worker:ai

# Production (Docker)
docker-compose up ai-worker
```
