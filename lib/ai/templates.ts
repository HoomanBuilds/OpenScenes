import { z } from 'zod';
import { SlideElement } from '../schemas/template';
import { CANVAS } from './config';

export const TitleModernBoldSchema = z.object({
  title: z.string().describe("Main presentation title"),
  subtitle: z.string().describe("Impactful energetic subtitle"),
  bgImageQuery: z.string().describe("Unsplash search query for background"),
});

export const ComparisonSplitCardsSchema = z.object({
  leftTitle: z.string().describe("Title for the left side item"),
  leftPoints: z.array(z.string()).describe("3-4 key points for left side"),
  rightTitle: z.string().describe("Title for the right side item"),
  rightPoints: z.array(z.string()).describe("3-4 key points for right side"),
});

export const FeatureGridSchema = z.object({
  heading: z.string().describe("Main section heading"),
  features: z.array(z.object({
    title: z.string(),
    description: z.string(),
    icon: z.string().describe("Lucide icon name (kebab-case)")
  })).max(4).describe("List of 3-4 major features")
});

export const StatsBigNumberSchema = z.object({
    heading: z.string().describe("Context for the statistic"),
    bigNumber: z.string().describe("The main number (e.g. '85%', '$10M')"),
    subtext: z.string().describe("Explanation of what the number means")
});

export const CtaCenteredSchema = z.object({
    headline: z.string().describe("Main call to action headline"),
    subtext: z.string().describe("Supporting text or contact info"),
    buttonText: z.string().optional().describe("Optional button label")
});

// 2. The Registry and Render Functions
export const TEMPLATE_REGISTRY = {
  'title_modern_bold': {
    name: 'Modern Bold Title',
    description: 'Use for the very first slide. Big, bold typography with a cinematic background.',
    schema: TitleModernBoldSchema,
    slideType: 'title',
    render: (data: z.infer<typeof TitleModernBoldSchema>, theme: any): SlideElement[] => {
      const bg: SlideElement = {
        id: 'bg-image',
        type: 'image',
        x: 0,
        y: 0,
        width: CANVAS.width,
        height: CANVAS.height,
        content: data.bgImageQuery,
        zIndex: 0,
        opacity: 0.4,
        objectFit: 'cover'
      };

      const gradientOverlay: SlideElement = {
        id: 'bg-gradient',
        type: 'shape',
        content: 'rect',
        x: 0,
        y: 0,
        width: CANVAS.width,
        height: CANVAS.height,
        color: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.8))',
        zIndex: 1
      };

      const title: SlideElement = {
        id: 'hero-title',
        type: 'headline',
        x: 50,
        y: CANVAS.height / 2 - 80,
        width: CANVAS.width - 100,
        height: 160,
        content: data.title,
        zIndex: 10,
        fontSize: 96,
        fontWeight: 'bold',
        textAlign: 'center',
        textColor: '#ffffff',
        animation: { type: 'slide', duration: 1.0, delay: 0.2, direction: 'up', ease: 'backOut' }
      };

      const subtitle: SlideElement = {
        id: 'hero-subtitle',
        type: 'subheadline',
        x: 100,
        y: CANVAS.height / 2 + 90,
        width: CANVAS.width - 200,
        height: 80,
        content: data.subtitle,
        zIndex: 10,
        fontSize: 32,
        fontWeight: 'normal',
        textAlign: 'center',
        textColor: 'rgba(255,255,255,0.9)',
        letterSpacing: 2,
        animation: { type: 'fade', duration: 1.0, delay: 0.5 }
      };

      return [bg, gradientOverlay, title, subtitle];
    }
  },
  'comparison_split_cards': {
    name: 'Split Comparison',
    description: 'Use when comparing two opposing ideas, products, or eras (e.g. Old vs New).',
    schema: ComparisonSplitCardsSchema,
    slideType: 'comparison',
    render: (data: z.infer<typeof ComparisonSplitCardsSchema>, theme: any): SlideElement[] => {
      const midX = CANVAS.width / 2;
      
      const leftBg: SlideElement = {
        id: 'left-bg',
        type: 'shape',
        content: 'rect',
        x: 40,
        y: 80,
        width: midX - 60,
        height: CANVAS.height - 120,
        color: 'rgba(255,255,255,0.03)',
        borderRadius: 24,
        zIndex: 1,
        border: '1px solid rgba(255,255,255,0.1)'
      };

      const rightBg: SlideElement = {
        id: 'right-bg',
        type: 'shape',
        content: 'rect',
        x: midX + 20,
        y: 80,
        width: midX - 60,
        height: CANVAS.height - 120,
        color: 'rgba(255,255,255,0.03)',
        borderRadius: 24,
        zIndex: 1,
        border: '1px solid rgba(255,255,255,0.1)'
      };

      const leftTitle: SlideElement = {
        id: 'left-title',
        type: 'headline',
        x: 60,
        y: 110,
        width: midX - 100,
        height: 60,
        content: data.leftTitle,
        fontSize: 42,
        fontWeight: 'bold',
        textColor: theme?.colors?.accent_secondary || '#f87171',
        textAlign: 'left',
        zIndex: 10
      };

      const rightTitle: SlideElement = {
        id: 'right-title',
        type: 'headline',
        x: midX + 40,
        y: 110,
        width: midX - 100,
        height: 60,
        content: data.rightTitle,
        fontSize: 42,
        fontWeight: 'bold',
        textColor: theme?.colors?.accent_primary || '#4ade80',
        textAlign: 'left',
        zIndex: 10
      };

      const leftList: SlideElement = {
        id: 'left-list',
        type: 'text',
        textFormat: 'markdown',
        x: 60,
        y: 190,
        width: midX - 100,
        height: 380,
        content: data.leftPoints.map(p => `• ${p}`).join('\n\n'),
        fontSize: 26,
        lineHeight: 1.8,
        textColor: '#d4d4d8',
        zIndex: 10,
        animation: { type: 'fade', duration: 0.8, delay: 0.3 }
      };

       const rightList: SlideElement = {
        id: 'right-list',
        type: 'text',
        textFormat: 'markdown',
        x: midX + 40,
        y: 190,
        width: midX - 100,
        height: 380,
        content: data.rightPoints.map(p => `• ${p}`).join('\n\n'),
        fontSize: 26,
        lineHeight: 1.8,
        textColor: '#d4d4d8',
        zIndex: 10,
        animation: { type: 'fade', duration: 0.8, delay: 0.4 }
      };

      return [leftBg, rightBg, leftTitle, rightTitle, leftList, rightList];
    }
  },
  'feature_grid': {
    name: 'Feature Grid',
    description: 'Use to showcase 3-4 distinct features or benefits side-by-side.',
    schema: FeatureGridSchema,
    slideType: 'features',
    render: (data: z.infer<typeof FeatureGridSchema>, theme: any): SlideElement[] => {
       const elements: SlideElement[] = [];

       elements.push({
           id: 'grid-heading',
           type: 'headline',
           x: 50,
           y: 40,
           width: CANVAS.width - 100,
           height: 80,
           content: data.heading.toUpperCase(),
           fontSize: 52,
           textAlign: 'center',
           fontWeight: 'bold',
           letterSpacing: 2,
           zIndex: 10,
           textColor: '#ffffff',
           animation: { type: 'slide', direction: 'down', duration: 0.8 }
       });

       const count = Math.min(data.features.length, 4);
       const gap = 30;
       const startX = 60;
       const availableWidth = CANVAS.width - 120;
       const cardWidth = (availableWidth - (gap * (count - 1))) / count;
       const cardY = 150;
       const cardHeight = 380;

       data.features.slice(0, 4).forEach((feature, i) => {
          const x = startX + (i * (cardWidth + gap));
          
          elements.push({
              id: `card-bg-${i}`,
              type: 'shape',
              content: 'rect',
              x, 
              y: cardY,
              width: cardWidth,
              height: cardHeight,
              color: 'rgba(255,255,255,0.04)',
              borderRadius: 20,
              zIndex: 2,
              border: '1px solid rgba(255,255,255,0.08)',
              animation: { type: 'scale', duration: 0.5, delay: 0.2 + (i * 0.15) }
          });

          elements.push({
            id: `card-icon-${i}`,
            type: 'headline',
            x: x + 20,
            y: cardY + 30,
            width: 60,
            height: 60,
            content: "✦", 
            fontSize: 48,
            textColor: theme?.colors?.accent_primary || '#6366f1',
            zIndex: 10
          });

          elements.push({
            id: `card-title-${i}`,
            type: 'subheadline',
            x: x + 20,
            y: cardY + 110,
            width: cardWidth - 40,
            height: 40,
            content: feature.title,
            fontSize: 28,
            fontWeight: 'bold',
            textColor: '#ffffff',
            zIndex: 10
          });

          elements.push({
            id: `card-desc-${i}`,
            type: 'text',
            x: x + 20,
            y: cardY + 160,
            width: cardWidth - 40,
            height: 200,
            content: feature.description,
            fontSize: 20,
            textColor: '#a1a1aa',
            lineHeight: 1.5,
            zIndex: 10
          });
       });

       return elements;
    }
  },
  'stats_big_number': {
      name: 'Big Statistic',
      description: 'Use to highlight a single, critical metric or number.',
      schema: StatsBigNumberSchema,
      slideType: 'metrics',
      render: (data: z.infer<typeof StatsBigNumberSchema>, theme: any): SlideElement[] => {
          const accentObj: SlideElement = {
              id: 'stat-accent',
              type: 'shape',
              content: 'circle',
              x: CANVAS.width / 2 - 250,
              y: CANVAS.height / 2 - 250,
              width: 500,
              height: 500,
              color: theme?.colors?.accent_primary || '#3b82f6',
              opacity: 0.1,
              zIndex: 0,
              animation: { type: 'pulse', duration: 3 }
          };

          return [
              accentObj,
              {
                  id: 'stat-heading',
                  type: 'subheadline',
                  x: 50,
                  y: 120,
                  width: CANVAS.width - 100,
                  height: 60,
                  content: data.heading.toUpperCase(),
                  fontSize: 24,
                  textAlign: 'center',
                  textColor: theme?.colors?.accent_secondary || '#818cf8',
                  letterSpacing: 4,
                  zIndex: 10
              },
              {
                  id: 'stat-number',
                  type: 'headline',
                  x: 50,
                  y: 180,
                  width: CANVAS.width - 100,
                  height: 220,
                  content: data.bigNumber,
                  fontSize: 200,
                  fontWeight: 'bold',
                  textAlign: 'center',
                  textColor: '#ffffff',
                  zIndex: 10,
                  animation: { type: 'scale', duration: 1.0, delay: 0.1, ease: 'backOut' }
              },
              {
                  id: 'stat-subtext',
                  type: 'text',
                  x: 100,
                  y: 420,
                  width: CANVAS.width - 200,
                  height: 100,
                  content: data.subtext,
                  fontSize: 32,
                  textAlign: 'center',
                  textColor: '#e4e4e7',
                  zIndex: 10
              }
          ];
      }
  },
  'cta_centered': {
      name: 'Centered Call to Action',
      description: 'Use for final slides with a clear call to action, contact info, or closing statement.',
      schema: CtaCenteredSchema,
      slideType: 'cta',
      render: (data: z.infer<typeof CtaCenteredSchema>, theme: any): SlideElement[] => {
          return [
              {
                  id: 'cta-bg-glow',
                  type: 'shape',
                  content: 'circle',
                  x: CANVAS.width / 2 - 300,
                  y: CANVAS.height / 2 - 300,
                  width: 600,
                  height: 600,
                  color: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(0,0,0,0) 70%)',
                  zIndex: 0
              },
              {
                  id: 'cta-headline',
                  type: 'headline',
                  x: 50,
                  y: CANVAS.height / 2 - 80,
                  width: CANVAS.width - 100,
                  height: 100,
                  content: data.headline,
                  fontSize: 72,
                  fontWeight: 'bold',
                  textAlign: 'center',
                  textColor: '#ffffff',
                  zIndex: 10,
                  animation: { type: 'scale', duration: 0.8, delay: 0.1 }
              },
              {
                  id: 'cta-subtext',
                  type: 'text',
                  x: 100,
                  y: CANVAS.height / 2 + 50,
                  width: CANVAS.width - 200,
                  height: 60,
                  content: data.subtext,
                  fontSize: 28,
                  textAlign: 'center',
                  textColor: '#94a3b8',
                  zIndex: 10,
                  animation: { type: 'fade', duration: 0.8, delay: 0.4 }
              }
          ];
      }
  }
} as const;

export type TemplateId = keyof typeof TEMPLATE_REGISTRY;

export function getTemplateDescriptions(): string {
  return Object.entries(TEMPLATE_REGISTRY)
    .map(([id, t]) => `- "${id}": ${t.description}`)
    .join('\n');
}
