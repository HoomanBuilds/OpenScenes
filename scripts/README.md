# Test Scripts

This directory contains test scripts for the AI editing pipelines.

## Available Tests

### 1. Slide Edit Pipeline (`test-slide-edit.ts`)

Tests single slide editing using the smart editor.

**Usage:**
```bash
npm run test:slide-edit
```

**What it does:**
- Loads a single slide from test data
- Applies an AI edit instruction to that slide
- Outputs the original and edited slide for comparison

**Output:** `scripts/results/slide-edit-output.json`

---

### 2. Slide Edit Scenarios (`test-slide-edit-scenarios.ts`)

Comprehensive test suite that runs multiple editing scenarios on a single slide.

**Usage:**
```bash
npm run test:slide-edit-scenarios
```

**Test Scenarios:**
- **content-edit**: Text modifications
- **style-edit**: Color and visual effects
- **animation-edit**: Animation changes
- **background-edit**: Background modifications
- **complex-edit**: Multiple properties at once

**Output:** `scripts/results/slide-edit-scenarios/`
- Individual JSON files for each scenario
- `_summary.json` with test results

---

### 3. Slide Edit API Flow (`test-slide-edit-api-flow.ts`)

Tests the complete API flow from frontend request to worker response.

**Usage:**
```bash
npm run test:slide-edit-api-flow
```

**What it does:**
- Simulates frontend API request format
- Processes through smart editor (worker logic)
- Validates response format for frontend
- Measures end-to-end processing time

**Output:** `scripts/results/slide-edit-api-flow.json`

---

### 4. Global Edit Pipeline (`test-global-edit.ts`)

Tests multi-slide global editing across an entire presentation.

**Usage:**
```bash
npm run test:global-edit
```

**What it does:**
- Loads multiple slides
- Applies global changes across all slides
- Outputs patched presentation

**Output:** `scripts/results/patch-output.json`

---

## Prerequisites

Before running tests, ensure:

1. Environment variables are configured (`.env` file)
2. Test data exists: `scripts/results/global-output.json`
3. AI models are accessible

## Test Data

The tests use `scripts/results/global-output.json` as input. This file should contain valid slide data structure.

## Understanding Results

### Slide Edit Output
```json
{
  "instruction": "...",
  "original": { /* Original slide */ },
  "edited": { /* Modified slide */ },
  "timestamp": "..."
}
```

### Scenario Test Summary
```json
{
  "totalTests": 5,
  "passed": 5,
  "failed": 0,
  "averageDuration": 1234,
  "results": [...]
}
```

## API Integration

The slide edit API endpoint at `/api/ai/edit/slide/route.ts` uses the same `smartEditSlide` function that these tests validate.

**Flow:**
```
Frontend → API Route → Queue → Worker → smartEditSlide → Result
```

These tests validate the core `smartEditSlide` logic independently of the queue system.
