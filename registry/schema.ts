import { z } from "zod";

// The finite set of allowed components (The Registry Keys)
export const RegistryComponentEnum = z.enum([
  "TITLE_CENTER_FADE",
  "TITLE_SUBTITLE_STACK",
  "FULLSCREEN_STATEMENT",
  "BACKGROUND_GRADIENT", // Potentially a layer, but let's keep it simple for now (1 slide)
  "ACCENT_LINE_REVEAL",
]);

export type RegistryComponentType = z.infer<typeof RegistryComponentEnum>;

// Core Types
export const MotionIntensity = z.enum(["low", "medium", "high"]);
export const TextDensity = z.enum(["minimal", "balanced", "dense"]);
export const ThemeId = z.enum(["dark", "light", "cinematic", "minimal"]);

// Component Data Schema (What dictates the props)
export const ComponentContentSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  highlightText: z.string().optional(),
  extras: z.record(z.string(), z.string()).optional(),
});

export const MotionSettingsSchema = z.object({
  intensity: MotionIntensity,
  enterDuration: z.number().describe("Frames for entry animation"),
  exitDuration: z.number().describe("Frames for exit animation"),
  holdDuration: z.number().describe("Frames to hold static"),
});

export const StyleSettingsSchema = z.object({
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  fontFamily: z.string().optional(),
});

// The Slide (Atomic Unit)
export const SlideSchema = z.object({
  id: z.string(),
  componentId: RegistryComponentEnum,
  content: ComponentContentSchema,
  timing: z.object({
    durationInFrames: z.number(),
  }),
  motion: MotionSettingsSchema,
  style: StyleSettingsSchema.optional(),
});

// The Master Plan (Execution Root)
export const ExecutionPlanSchema = z.object({
  video: z.object({
    totalDurationWait: z.number().optional().describe("User requested seconds"),
    totalDurationFrames: z.number(),
    theme: ThemeId,
    fps: z.number().default(30),
    width: z.number().default(1080),
    height: z.number().default(1920), // Vertical video default? Or 16:9. Let's assume 1080p landscape for desktop or 1080x1920 phone. Prompt said "Player", usually landscape is safer for prototypes, vertical for social. I'll default to 1920x1080 (Landscape).
  }),
  slides: z.array(SlideSchema).min(1).max(1), // Constraint: 1 slide
});

export type ExecutionPlan = z.infer<typeof ExecutionPlanSchema>;
export type SlidePlan = z.infer<typeof SlideSchema>;
