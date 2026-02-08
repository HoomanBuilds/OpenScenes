import { z } from 'zod';
import { SlideElement } from '../schemas/template';
import { CANVAS } from './config';

// --- ANIMATION PRESETS ---
const ANIMATIONS = {
  fadeIn: { type: 'fade', duration: 0.8 },
  slideUp: { type: 'slide', duration: 0.8, direction: 'up', ease: 'backOut' },
  slideRight: { type: 'slide', duration: 0.8, direction: 'right', ease: 'backOut' },
  scaleUp: { type: 'scale', duration: 0.6, ease: 'backOut' },
  pop: { type: 'pop', duration: 0.5, ease: 'backOut' },
  slowZoom: { type: 'scale', duration: 10, delay: 0 },
  pulse: { type: 'pulse', duration: 3 }
} as const;

// --- THEME SYSTEM ---

export const THEMES = {
  modern: {
    name: 'Modern Dark',
    colors: {
        bg: '#0a0a0a',
        surface: '#18181b',
        surfaceHighlight: '#27272a',
        textMain: '#ffffff',
        textMuted: '#a1a1aa',
        accent: '#6366f1', // Indigo
        accentGlow: 'rgba(99,102,241,0.3)',
        border: 'rgba(255,255,255,0.1)'
    }
  },
  neon: {
    name: 'Cyber Neon',
    colors: {
        bg: '#09090b',
        surface: '#18181b',
        surfaceHighlight: '#27272a',
        textMain: '#ffffff',
        textMuted: '#a1a1aa', // Zinc 400
        accent: '#ec4899', // Pink
        accentGlow: 'rgba(236, 72, 153, 0.3)',
        border: 'rgba(236, 72, 153, 0.2)'
    }
  },
  emerald: {
    name: 'Eco Future',
    colors: {
        bg: '#022c22', // Teal 950
        surface: '#064e3b', // Teal 900
        surfaceHighlight: '#115e59', // Teal 800
        textMain: '#ecfdf5', // Teal 50
        textMuted: '#99f6e4', // Teal 200
        accent: '#34d399', // Emerald 400
        accentGlow: 'rgba(52, 211, 153, 0.3)',
        border: 'rgba(52, 211, 153, 0.2)'
    }
  }, 
  luxury: {
    name: 'Gold Luxury',
    colors: {
        bg: '#000000',
        surface: '#1c1917', // Stone 900
        surfaceHighlight: '#292524', // Stone 800
        textMain: '#fafaf9', // Stone 50
        textMuted: '#a8a29e', // Stone 400
        accent: '#fbbf24', // Amber 400
        accentGlow: 'rgba(251, 191, 36, 0.3)',
        border: 'rgba(251, 191, 36, 0.2)'
    }
  }
} as const;

type ThemeKey = keyof typeof THEMES;
const DEFAULT_THEME = 'modern';

const getTheme = (key?: string) => {
    return THEMES[(key as ThemeKey) || DEFAULT_THEME].colors;
}

// --- HELPERS ---

// Dynamically adjust font size based on text length to prevent overflow
const getAdaptiveFontSize = (text: string, baseSize: number, minSize: number = 16, charThreshold: number = 20) => {
    if (!text) return baseSize;
    const excess = Math.max(0, text.length - charThreshold);
    // Rough heuristic: reduce size by 1px for every N chars over threshold
    const reduction = Math.floor(excess / 2); 
    return Math.max(minSize, baseSize - reduction);
}

const ThemeEnum = z.enum(['modern', 'neon', 'emerald', 'luxury']).describe("Visual theme. 'modern' (indigo), 'neon' (pink), 'emerald' (green), 'luxury' (gold).");

export const TitleModernBoldSchema = z.object({
  title: z.string().max(80).describe("Main title. MAX 8 WORDS. Massive impact."),
  subtitle: z.string().max(120).describe("Subtitle. MAX 15 WORDS. Short punchline."),
  bgImageQuery: z.string().describe("Unsplash query. Abstract, dark, cinematic."),
  theme: ThemeEnum.default('modern')
});

export const ComparisonSplitCardsSchema = z.object({
  leftTitle: z.string().max(50).describe("Left header. MAX 5 WORDS."),
  leftPoints: z.array(z.string().max(100)).max(3).describe("3 negatives. MAX 10 WORDS."),
  rightTitle: z.string().max(50).describe("Right header. MAX 5 WORDS."),
  rightPoints: z.array(z.string().max(100)).max(3).describe("3 positives. MAX 10 WORDS."),
  theme: ThemeEnum.default('modern')
});

export const FeatureGridSchema = z.object({
  heading: z.string().max(100).describe("Section header. MAX 8 WORDS."),
  features: z.array(z.object({
    title: z.string().max(80).describe("Feature name. MAX 6 WORDS."),
    description: z.string().max(250).describe("Description. MAX 2 SENTENCES."),
    icon: z.string().describe("Lucide icon name")
  })).min(3).max(3).describe("List of exactly 3 features."),
  theme: ThemeEnum.default('modern')
});

export const StatsBigNumberSchema = z.object({
    heading: z.string().max(80).describe("Context. MAX 8 WORDS."),
    bigNumber: z.string().max(30).describe("Number. SHORT (e.g. '95%', '$10B')."),
    subtext: z.string().max(150).describe("Footer text. MAX 2 LINES."),
    theme: ThemeEnum.default('modern')
});

export const CtaCenteredSchema = z.object({
    headline: z.string().max(100).describe("Actionable headline. MAX 10 WORDS."),
    subtext: z.string().max(200).describe("Contact/Details. MAX 3 LINES."),
    buttonText: z.string().max(40).optional().describe("Button label. MAX 4 WORDS."),
    theme: ThemeEnum.default('modern')
});

export const TEMPLATE_REGISTRY = {
  // Inspired by NeoTokyo Slide 1 & Nova Slide 1
  'title_modern_bold': {
    name: 'Neo-Nova Title',
    description: 'Massive typography with deep atmospheric glow.',
    schema: TitleModernBoldSchema,
    slideType: 'title',
    render: (data: z.infer<typeof TitleModernBoldSchema>, theme: any): SlideElement[] => {
      const colors = getTheme(data.theme);
      return [
        // Dark Atmospheric BG
        {
          id: 'bg-grad',
          type: 'shape', content: 'rect',
          x: 0, y: 0, width: CANVAS.width, height: CANVAS.height,
          color: 'radial-gradient(circle at 50% 120%, #1e1b4b 0%, #0a0a0a 100%)', // Deep indigo to black
          zIndex: 0
        },
        // Glowing Orb (Nova Style)
        {
            id: 'glow-orb',
            type: 'shape', content: 'circle',
            x: CANVAS.width / 2 - 400, y: -200, width: 800, height: 800,
            color: colors.accent, opacity: 0.15, zIndex: 0,
            animation: { type: 'pulse', duration: 4 }
        },
        // Diagonal Slice (NeoTokyo Style)
        {
            id: 'accent-slice',
            type: 'shape', content: 'rect',
            x: CANVAS.width - 300, y: -100, width: 100, height: 800,
            color: colors.accent, rotation: 15, opacity: 0.8, zIndex: 1,
            animation: { ...ANIMATIONS.slideUp, delay: 0.2 }
        },
        // Massive Text 
        {
          id: 'hero-title',
          type: 'headline',
          x: 50, y: 140, width: 900, height: 300,
          content: data.title.toUpperCase(),
          zIndex: 10,
          fontSize: getAdaptiveFontSize(data.title, 130, 60, 15), // Adaptive: base 130, min 60
          fontWeight: 'bold',
          textAlign: 'left',
          textColor: colors.textMain,
          lineHeight: 0.85,
          letterSpacing: -2,
          animation: { ...ANIMATIONS.pop, delay: 0.3 }
        },
        {
          id: 'hero-subtitle',
          type: 'subheadline',
          x: 60, y: 440, width: 800, height: 60,
          content: data.subtitle,
          zIndex: 10,
          fontSize: getAdaptiveFontSize(data.subtitle, 32, 20, 40),
          fontWeight: 'normal',
          textAlign: 'left',
          textColor: colors.textMuted,
          letterSpacing: 1,
          animation: { ...ANIMATIONS.fadeIn, delay: 0.6 }
        }
      ];
    }
  },

  // Inspired by Nova Slide 7 (Pricing) -> Split comparison
  'comparison_split_cards': {
    name: 'Glass Comparison',
    description: 'Two distinct cards with glassmorphism.',
    schema: ComparisonSplitCardsSchema,
    slideType: 'comparison',
    render: (data: z.infer<typeof ComparisonSplitCardsSchema>, theme: any): SlideElement[] => {
      const colors = getTheme(data.theme);
      const midX = CANVAS.width / 2;
      
      return [
        // Base BG
        {
            id: 'bg-base', type: 'shape', content: 'rect',
            x: 0, y: 0, width: CANVAS.width, height: CANVAS.height,
            color: '#111111', zIndex: 0
        },
        // Subtle Blobs
        {
            id: 'bg-patch-1', type: 'shape', content: 'circle',
            x: 700, y: -100, width: 500, height: 500,
            color: '#252525', opacity: 0.5, zIndex: 0,
            animation: { type: 'pulse', duration: 8 }
        },
        {
           id: 'bg-patch-2', type: 'shape', content: 'circle',
           x: -100, y: 300, width: 600, height: 600,
           color: '#1a1a1a', opacity: 0.4, zIndex: 0
        },
        // Main Heading
        {
          id: 'main-heading', type: 'headline',
          x: 50, y: 40, width: 900, height: 50,
          content: "Comparison",
          fontSize: 48, fontWeight: 'bold', textAlign: 'center', textColor: '#ffffff',
          zIndex: 10, letterSpacing: -1,
          animation: { type: 'fade', duration: 0.8 }
        },
        // Left Card (Traditional)
        {
            id: 'card-left-bg', type: 'shape', content: 'rect',
            x: 50, y: 140, width: 430, height: 380,
            color: '#1c1c1c', borderRadius: 12, zIndex: 5,
             animation: { type: 'slide', direction: 'up', duration: 0.6, delay: 0.2 }
        },
        {
            id: 'left-header', type: 'subheadline',
            content: data.leftTitle.toUpperCase(),
            x: 90, y: 170, width: 350, height: 30,
            fontSize: getAdaptiveFontSize(data.leftTitle, 14, 10, 20), fontWeight: 'bold', textColor: '#737373', textAlign: 'left',
            zIndex: 10, letterSpacing: 2,
            animation: { type: 'fade', duration: 0.6, delay: 0.4 }
        },
        {
            id: 'left-list', type: 'list', listType: 'disc',
            content: data.leftPoints.join('\n'), // Changed to use raw text for list component
            x: 90, y: 220, width: 350, height: 280,
            fontSize: 18, textColor: '#a3a3a3', lineHeight: 1.6, // Smaller base size for lists
            zIndex: 10, animation: { type: 'fade', duration: 0.6, delay: 0.5 }
        },
        // Right Card (Modern)
        {
            id: 'card-right-bg', type: 'shape', content: 'rect',
            x: 520, y: 140, width: 430, height: 380,
            color: '#262626', borderRadius: 12, zIndex: 5,
            border: '1px solid #404040',
            animation: { type: 'slide', direction: 'up', duration: 0.6, delay: 0.4 }
        },
        {
            id: 'right-header', type: 'subheadline',
            content: data.rightTitle.toUpperCase(),
            x: 560, y: 170, width: 350, height: 30,
            fontSize: getAdaptiveFontSize(data.rightTitle, 14, 10, 20), fontWeight: 'bold', textColor: '#ffffff', textAlign: 'left',
            zIndex: 10, letterSpacing: 2,
            animation: { type: 'fade', duration: 0.6, delay: 0.6 }
        },
        {
            id: 'right-list', type: 'list', listType: 'disc',
            content: data.rightPoints.join('\n'),
            x: 560, y: 220, width: 350, height: 280,
            fontSize: 18, textColor: '#ffffff', lineHeight: 1.6,
            zIndex: 10, animation: { type: 'fade', duration: 0.6, delay: 0.7 }
        },
        // Accent Bar
        {
            id: 'accent-bar', type: 'shape', content: 'rect',
            x: 520, y: 140, width: 430, height: 4,
            color: '#3b82f6', borderRadius: 4, zIndex: 11,
            animation: { type: 'scale', duration: 0.6, delay: 0.8 }
        }
      ];
    }
  },

  // Inspired by Nova Slide 4 (Features)
  'feature_grid': {
    name: 'Bento Features',
    description: 'Clean, card-based feature list.',
    schema: FeatureGridSchema,
    slideType: 'features',
    render: (data: z.infer<typeof FeatureGridSchema>, theme: any): SlideElement[] => {
       const colors = getTheme(data.theme);
       const els: SlideElement[] = [];
       
       els.push({
           id: 'bg', type: 'shape', content: 'rect',
           x: 0, y: 0, width: CANVAS.width, height: CANVAS.height,
           color: '#0a0a0a', zIndex: 0
       });

       els.push({
           id: 'heading', type: 'headline',
           content: data.heading,
           x: 50, y: 50, width: 900, height: 60,
           fontSize: 48, textAlign: 'center', fontWeight: 'bold', textColor: colors.textMain,
           zIndex: 10, animation: ANIMATIONS.slideUp
       });

       const cardW = 280;
       const gap = 40;
       const startX = (CANVAS.width - (3 * cardW + 2 * gap)) / 2;
       const cardY = 150;

       data.features.slice(0, 3).forEach((f, i) => {
           const x = startX + i * (cardW + gap);
           
           els.push({
               id: `card-bg-${i}`, type: 'shape', content: 'rect',
               x, y: cardY, width: cardW, height: 350,
               color: '#18181b', borderRadius: 20, zIndex: 1,
               border: '1px solid #27272a',
               animation: { ...ANIMATIONS.slideUp, delay: 0.2 + (i * 0.1) }
           });

           // Accent Icon Circle
           els.push({
               id: `icon-bg-${i}`, type: 'shape', content: 'circle',
               x: x + 24, y: cardY + 30, width: 50, height: 50,
               color: 'rgba(255,255,255,0.05)', zIndex: 2
           });
             els.push({
               id: `icon-${i}`, type: 'headline', content: '✦',
               x: x + 24, y: cardY + 35, width: 50, height: 50,
               fontSize: 24, textColor: colors.accent, textAlign: 'center', zIndex: 3
           });

           els.push({
               id: `title-${i}`, type: 'subheadline', content: f.title,
               x: x + 24, y: cardY + 100, width: cardW - 48, height: 40,
               fontSize: 24, fontWeight: 'bold', textColor: colors.textMain, zIndex: 2
           });

           els.push({
               id: `desc-${i}`, type: 'text', content: f.description,
               x: x + 24, y: cardY + 150, width: cardW - 48, height: 150,
               fontSize: 18, lineHeight: 1.5, textColor: colors.textMuted, zIndex: 2
           });
       });

       return els;
    }
  },

  // Inspired by Nova Slide 5 (Metrics)
  'stats_big_number': {
      name: 'Impact Logic',
      description: 'Single massive number with context.',
      schema: StatsBigNumberSchema,
      slideType: 'metrics',
      render: (data: z.infer<typeof StatsBigNumberSchema>, theme: any): SlideElement[] => {
          const colors = getTheme(data.theme);
          return [
              {
                  id: 'bg-grad', type: 'shape', content: 'rect',
                  x: 0, y: 0, width: CANVAS.width, height: CANVAS.height,
                  color: 'linear-gradient(135deg, #0a0a0a 0%, #18181b 100%)', zIndex: 0
              },
              // Glowing Ring (Nova Style)
              {
                  id: 'glow-ring', type: 'shape', content: 'circle',
                  x: CANVAS.width/2 - 250, y: CANVAS.height/2 - 250, width: 500, height: 500,
                  color: 'transparent', border: `1px solid ${colors.surfaceHighlight}`,
                  opacity: 0.5, zIndex: 1
              },
               {
                  id: 'glow-ring-2', type: 'shape', content: 'circle',
                  x: CANVAS.width/2 - 300, y: CANVAS.height/2 - 300, width: 600, height: 600,
                  color: 'transparent', border: `1px dashed ${colors.surfaceHighlight}`,
                  opacity: 0.3, zIndex: 0,
                  animation: { type: 'pulse', duration: 8 }
              },
              {
                  id: 'stat-heading', type: 'subheadline',
                  content: data.heading.toUpperCase(),
                  x: 0, y: 100, width: CANVAS.width, height: 40,
                  fontSize: 24, textAlign: 'center', textColor: colors.accent, letterSpacing: 4,
                  zIndex: 2, animation: ANIMATIONS.fadeIn
              },
              {
                  id: 'stat-val', type: 'headline',
                  content: data.bigNumber,
                  x: 0, y: 160, width: CANVAS.width, height: 240,
                  fontSize: getAdaptiveFontSize(data.bigNumber, 220, 100, 4), fontWeight: 'bold', textAlign: 'center', textColor: colors.textMain,
                  zIndex: 2, animation: { ...ANIMATIONS.scaleUp, delay: 0.2 }
              },
              {
                  id: 'stat-sub', type: 'text',
                  content: data.subtext,
                  x: 0, y: 420, width: CANVAS.width, height: 60,
                  fontSize: 28, textAlign: 'center', textColor: colors.textMuted,
                  zIndex: 2, animation: { ...ANIMATIONS.fadeIn, delay: 0.4 }
              }
          ];
      }
  },

  // Inspired by Nova Slide 10 (CTA) & NeoTokyo Slide 6
  'cta_centered': {
      name: 'Final Call',
      description: 'Minimal, centered call to action.',
      schema: CtaCenteredSchema,
      slideType: 'cta',
      render: (data: z.infer<typeof CtaCenteredSchema>, theme: any): SlideElement[] => {
          const colors = getTheme(data.theme);
          const els: SlideElement[] = [
             {
                  id: 'bg-grad', type: 'shape', content: 'rect',
                  x: 0, y: 0, width: CANVAS.width, height: CANVAS.height,
                  color: 'radial-gradient(circle at 50% 50%, #1e1b4b 0%, #0a0a0a 80%)', zIndex: 0
              },
              {
                  id: 'heading', type: 'headline',
                  content: data.headline,
                  x: 100, y: 150, width: 800, height: 160,
                  fontSize: getAdaptiveFontSize(data.headline, 72, 40, 30), fontWeight: 'bold', textAlign: 'center', textColor: colors.textMain,
                  lineHeight: 1.1, zIndex: 2,
                  animation: ANIMATIONS.scaleUp
              },
              {
                  id: 'sub', type: 'text',
                  content: data.subtext,
                  x: 200, y: 320, width: 600, height: 60,
                  fontSize: 24, textAlign: 'center', textColor: '#a5b4fc',
                  zIndex: 2, animation: { ...ANIMATIONS.fadeIn, delay: 0.2 }
              }
          ];

          if (data.buttonText) {
              els.push({
                  id: 'btn-bg', type: 'shape', content: 'rect',
                  x: CANVAS.width/2 - 140, y: 420, width: 280, height: 70,
                  color: colors.accent, borderRadius: 35, zIndex: 3,
                  animation: { ...ANIMATIONS.pop, delay: 0.4 }
              });
              els.push({
                  id: 'btn-txt', type: 'text', content: data.buttonText,
                  x: CANVAS.width/2 - 140, y: 438, width: 280, height: 40,
                  fontSize: 22, fontWeight: 'bold', textAlign: 'center', textColor: colors.textMain,
                  zIndex: 4, animation: { ...ANIMATIONS.fadeIn, delay: 0.5 }
              });
          }

          return els;
      }
  }
} as const;

export type TemplateId = keyof typeof TEMPLATE_REGISTRY;

export function getTemplateDescriptions(): string {
  return Object.entries(TEMPLATE_REGISTRY)
    .map(([id, t]) => `- "${id}": ${t.description}`)
    .join('\n');
}

