import { z } from 'zod';

export type CustomNode = {
  tag: string;
  className?: string;
  text?: string;
  id?: string;
  children?: CustomNode[];
  props?: Record<string, any>;
};

const BaseNodeSchema = z.object({
  tag: z.string().describe('HTML tag name (div, span, img, h1, p) or Motion component'),
  className: z.string().optional().describe('Tailwind classes for layout/spacing (flex, grid, p-4, gap-2)'),
  style: z.object({
    fontSize: z.string().optional(),
    fontWeight: z.string().optional(),
    fontFamily: z.string().optional(),
    lineHeight: z.string().optional(),
    color: z.string().optional(),
    backgroundColor: z.string().optional(),
    width: z.string().optional(),
    height: z.string().optional(),
    position: z.enum(['absolute', 'relative', 'fixed']).optional(),
    top: z.string().optional(),
    left: z.string().optional(),
    zIndex: z.number().optional(),
    opacity: z.number().optional(),
    transform: z.string().optional(),
    boxShadow: z.string().optional(),
    borderRadius: z.string().optional(),
    display: z.string().optional(),
    flexDirection: z.string().optional(),
    justifyContent: z.string().optional(),
    alignItems: z.string().optional(),
    textAlign: z.string().optional(),
    rotate: z.string().optional(),
    rotateX: z.string().optional(),
    rotateY: z.string().optional(),
    perspective: z.string().optional(),
  }).passthrough().optional().describe('CSS styles for exact positioning and typography'),
  text: z.string().optional().describe('Text content'),
  id: z.string().optional().describe('Unique ID for animation targeting'),
  props: z.record(z.string(), z.any()).optional(),
  
  initial: z.record(z.string(), z.any()).optional().describe('Initial state (opacity: 0, x: -50)'),
  animate: z.record(z.string(), z.any()).optional().describe('Target state (opacity: 1, x: 0)'),
  transition: z.object({
    duration: z.number().optional(),
    delay: z.number().optional(),
    ease: z.string().optional(),
    repeat: z.union([z.number(), z.string()]).optional(),
    staggerChildren: z.number().optional(),
    type: z.string().optional(),
  }).optional(),
  
  // Effects
  typing: z.object({
      speed: z.number().optional(),
      delay: z.number().optional()
  }).optional().describe('Typewriter effect settings'),
  
  effects: z.object({
      parallax: z.union([z.boolean(), z.object({ strength: z.number() })]).optional(),
      spotlight: z.object({ size: z.number().optional(), color: z.string().optional() }).optional()
  }).optional()
});

export const CustomNodeSchema: z.ZodType<CustomNode> = BaseNodeSchema.extend({
  children: z.lazy(() => z.array(CustomNodeSchema)).optional(),
});

export const CustomComponentOutputSchema = z.object({
  layout: CustomNodeSchema.describe('Root DOM node for the component'),
  animations: z.record(z.string(), z.object({
      initial: z.record(z.string(), z.any()).optional(),
      animate: z.record(z.string(), z.any()).optional(),
  })).optional().describe('Map of element IDs to their initial/animate states'),
  timeline: z.array(z.object({
    id: z.string().describe('Target element ID'), // ...
    amount: z.any().optional(),
    animate: z.record(z.string(), z.any()).describe('Animation properties (opacity, x, y, scale)'),
    transition: z.object({
      duration: z.number().optional(),
      delay: z.number().optional(),
      ease: z.string().optional(),
      type: z.string().optional(),
    }).optional(),
    label: z.string().optional(),
    comment: z.string().optional(),
    wait: z.boolean().optional(),
    parallel: z.boolean().optional(),
    guide: z.any().optional(),
  })).describe('Animation sequence'),
});
