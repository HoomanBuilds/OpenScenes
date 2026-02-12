import { editSlideSmart } from '../lib/ai/slide/pipeline';
import { Slide } from '../app/generate/types';

async function verifyFixes() {
    const slide: Slide = {
        id: 'slide-123',
        type: 'default',
        duration: 5000,
        background: { type: 'color', value: '#000000' },
        elements: [
            {
                id: 'rotated-text',
                type: 'text',
                content: 'I am tilted',
                x: 100, y: 100, width: 200, height: 50,
                rotation: 45,
                animation: { type: 'fade', duration: 1, delay: 0 }
            },
            {
                id: 'custom-card',
                type: 'custom',
                x: 300, y: 100, width: 300, height: 200,
                content: {
                    layout: {
                        id: 'card-root',
                        tag: 'div',
                        className: 'p-4 bg-zinc-800 rotate-12',
                        children: [
                            { id: 'card-title', tag: 'h2', text: 'Tilted Card' }
                        ]
                    },
                    animations: {
                        'card-root': { initial: { rotate: 12, opacity: 1 } }
                    },
                    timeline: []
                }
            }
        ]
    };

    console.log('--- TEST 1: Straightening Elements ---');
    const instruction = "make all card and text straight";
    
    const { executeActions } = require('../lib/ai/slide/executor');
    
    const actions1 = [
        {
            action: 'UPDATE_ANIMATION',
            targetId: 'rotated-text',
            properties: { rotation: 0 }
        }
    ];
    
    const result1 = executeActions(slide, actions1);
    console.log('Result 1 (Top Level Text Rotation):', result1.elements.find((e: any) => e.id === 'rotated-text').rotation);
    if (result1.elements.find((e: any) => e.id === 'rotated-text').rotation === 0) {
        console.log('✅ Top-level rotation fix works');
    } else {
        console.error('❌ Top-level rotation fix FAILED');
    }

    const actions2 = [
        {
            action: 'UPDATE_ANIMATION',
            targetId: 'card-root',
            properties: { rotate: 0 }
        }
    ];

    const result2 = executeActions(slide, actions2);
    const customEl = result2.elements.find((e: any) => e.id === 'custom-card');
    const nestedRotate = customEl.content.animations['card-root'].initial.rotate;
    console.log('Result 2 (Nested Custom Rotation):', nestedRotate);
    if (nestedRotate === 0) {
        console.log('✅ Nested custom rotation fix works');
    } else {
        console.error('❌ Nested custom rotation fix FAILED');
    }
}

verifyFixes().catch(console.error);
