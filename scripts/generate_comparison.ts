
import fs from 'fs';
import path from 'path';
import { TEMPLATE_REGISTRY } from '../lib/ai/templates';
import { Slide } from '../app/generate/types';

const OUTPUT_PATH = path.join(process.cwd(), 'app/generate/templates/example/example.json');

const data = {
    leftTitle: "Old Way",
    leftPoints: ["Hours of manual work", "Inconsistent designs", "Hard to update"],
    rightTitle: "Clarity AI",
    rightPoints: ["Instant generation", "Perfect consistency", "One-click updates"],
    theme: 'modern'
};

const template = TEMPLATE_REGISTRY['comparison_split_cards'];
const elements = template.render(data, { colors: null }); // Theme is handled inside now, passed arg ignored or cleaned up later

const slide: Slide = {
    id: 'comparison-slide-1',
    type: 'comparison',
    props: {},
    duration: 10000,
    elements: elements,
    background: { type: 'color', value: '#0a0a0a' }, // Deep dark bg
    transition: { type: 'fade', duration: 0.5 }
};

const presentation = {
    id: 'generated-comparison',
    name: "AI Comparison",
    slides: [slide],
    metadata: {
        generatedAt: new Date().toISOString(),
        themeName: 'modern',
        userQuery: 'comparison slide'
    }
};

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(presentation, null, 2));
console.log(`Generated Comparison Slide at ${OUTPUT_PATH}`);
