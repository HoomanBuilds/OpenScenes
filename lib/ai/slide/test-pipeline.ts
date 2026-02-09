import { editSlideSmart } from './pipeline';
import { Slide } from '../../../app/generate/types';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const mockSlide: Slide = {
    id: 'test-slide-1',
    type: 'default',
    duration: 5000,
    props: {},
    background: { type: 'color', value: '#000000' },
    elements: [
        {
            id: 'title-1',
            type: 'headline',
            content: 'Original Title',
            x: 50, y: 50, width: 800, height: 100,
            zIndex: 1
        },
        {
            id: 'container-main',
            type: 'custom',
            x: 0, y: 0, width: 1000, height: 600,
            content: {
                layout: {
                    id: 'layout-root',
                    tag: 'div',
                    className: 'flex flex-col gap-4 p-8',
                    children: [
                        { id: 'item-1', tag: 'div', text: 'Existing Item', className: 'p-4 bg-zinc-800' }
                    ]
                },
                animations: {
                    'item-1': { initial: { opacity: 1, y: 0 } }
                },
                timeline: [
                    { label: 'Step 1', delay: 0 }
                ]
            }
        }
    ]
};

async function runTests() {
    const logLines: string[] = [];
    const log = (msg: string) => {
        console.log(msg);
        logLines.push(msg);
    };

    log('\n================================================');
    log('🚀 STARTING COMPREHENSIVE AI PIPELINE TESTS');
    log('================================================\n');

    const testCases = [
        {
            name: "Change Text",
            instruction: "change the title to 'Welcome to Clarity'",
            validate: (slide: Slide) => {
                const el = slide.elements?.find(e => e.id === 'title-1');
                const text = (el?.content || '').toLowerCase();
                return text.includes('welcome') || text.includes('clarity');
            }
        },
        {
            name: "Update Background",
            instruction: "make the background dark blue",
            validate: (slide: Slide) => {
                const bg = slide.background?.value?.toLowerCase() || '';
                return bg !== '#000000' && (bg.includes('blue') || bg.startsWith('#0') || bg.startsWith('#1'));
            }
        },
        {
            name: "Add Components (Nested)",
            instruction: "add a small feature card inside 'container-main'",
            validate: (slide: Slide) => {
                const container = slide.elements?.find(e => e.id === 'container-main');
                const children = (container?.content as any)?.layout?.children || [];
                return children.length > 1; // Original had 1
            }
        },
        {
            name: "Positioned Addition (Middle)",
            instruction: "add a separator line before 'item-1'",
            validate: (slide: Slide) => {
                const container = slide.elements?.find(e => e.id === 'container-main');
                const children = (container?.content as any)?.layout?.children || [];
                const item1Index = children.findIndex((c: any) => c.id === 'item-1');
                const newItemIndex = children.findIndex((c: any) => JSON.stringify(c).toLowerCase().includes('tag')); // Any new tag
                return newItemIndex !== -1 && item1Index !== -1 && newItemIndex < item1Index;
            }
        },
        {
            name: "Animation and Timeline",
            instruction: "make everything popup with a bounce and add a 2s delay",
            validate: (slide: Slide) => {
                const json = JSON.stringify(slide).toLowerCase();
                return (json.includes('bounce') || json.includes('spring')) && /"delay":\s*2/.test(json);
            }
        },
        {
            name: "Removal",
            instruction: "remove the title",
            validate: (slide: Slide) => !slide.elements?.some(e => e.id === 'title-1')
        },
        {
            name: "History and Multi-turn",
            instruction: "now make it yellow",
            history: [
                { role: 'user', content: 'change the background to red' },
                { role: 'assistant', content: 'Changed background to red.' }
            ],
            validate: (slide: Slide) => {
                const bg = slide.background?.value?.toLowerCase() || '';
                return bg.includes('yellow') || bg === '#ffff00';
            }
        }
    ];

    let passed = 0;
    let failed = 0;

    for (let i = 0; i < testCases.length; i++) {
        const test = testCases[i] as any;
        log(`\n[TEST ${i + 1}/${testCases.length}] ${test.name}`);
        log(`  Instruction: "${test.instruction}"`);

        try {
            const result = await editSlideSmart(mockSlide, test.instruction, test.history);
            const isOk = test.validate(result.slide);

            if (isOk) {
                log(`  ✅ PASSED`);
                passed++;
            } else {
                log(`  ❌ FAILED (Validation mismatch)`);
                log(`  Reasoning: ${result.explanation}`);
                failed++;
            }
        } catch (e: any) {
            log(`  ❌ FAILED (Error: ${e.message})`);
            failed++;
        }
    }

    log('\n================================================');
    log(`📊 FINAL RESULTS: ${passed} Passed, ${failed} Failed`);
    log('================================================\n');

    const outputPath = path.join(process.cwd(), 'test_output_final.txt');
    fs.writeFileSync(outputPath, logLines.join('\n'), 'utf-8');
    if (failed > 0) process.exit(1);
}

runTests().catch(console.error);
