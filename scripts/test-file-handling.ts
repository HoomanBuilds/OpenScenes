import { truncateFileContent } from '../lib/ai/summarizer';
import { estimateTokens } from '../lib/ai/adapter';
import { AI_MAX_TOKENS } from '../lib/ai/config';
import * as dotenv from 'dotenv';

dotenv.config();

async function testTruncation() {
    console.log('--- Testing Even File Truncation ---');
    
    const limit = AI_MAX_TOKENS.summarizer.input / 2; // ~16k tokens
    
    // Scenario 1: Single massive file
    const massiveFile = '=== FILE: document.txt (text/plain) ===\n' + 'word '.repeat(30000);
    const result1 = truncateFileContent(massiveFile, limit);
    console.log(`Scenario 1 (Single File): Initial Tokens: ${estimateTokens(massiveFile)}, Resulting Tokens: ${estimateTokens(result1)}`);
    
    // Scenario 2: Multiple files
    const files = [
        '=== FILE: tech.txt ===\n' + 'tech '.repeat(10000),
        '=== FILE: business.txt ===\n' + 'money '.repeat(10000),
        '=== FILE: legal.txt ===\n' + 'law '.repeat(10000),
        '=== FILE: hr.txt ===\n' + 'people '.repeat(10000),
    ].join('\n\n');
    
    const result2 = truncateFileContent(files, limit);
    const resultingFiles = result2.split('=== FILE: ').filter(f => f.trim().length > 0);
    
    console.log(`Scenario 2 (4 Files): Initial Total Tokens: ${estimateTokens(files)}, Resulting Total Tokens: ${estimateTokens(result2)}`);
    console.log(`Files in result: ${resultingFiles.length}`);
    
    resultingFiles.forEach((f, i) => {
        console.log(`  File ${i + 1} Tokens: ${estimateTokens(f)} (Expected ~${Math.floor(limit / 4)})`);
    });
}

async function testSummarizerDetailedContent() {
    console.log('\n--- Testing Summarizer Detailed Content ---');
    const { summarizeContent } = await import('../lib/ai/summarizer');
    
    const mockInput = {
        userQuery: 'Create a pitch for a new AI drone.',
        fileContent: '=== FILE: product_spec.txt ===\n' + 'The AI Drone "Zenith" features a 4K camera, 40-minute flight time, and obstacle avoidance. MSRP is $1200. Target audience: real estate photographers.',
        jobId: 'test_sum_detailed'
    };

    try {
        const result = await summarizeContent(mockInput, true);
        console.log('Topic:', result.topic);
        console.log('Detailed Content Length (chars):', result.detailedContent?.length);
        console.log('Detailed Content Preview:', result.detailedContent?.slice(0, 100) + '...');
        
        if (result.detailedContent && result.detailedContent.length > 100) {
            console.log('✅ Detailed content extraction looks good.');
        } else {
            console.warn('⚠️ Detailed content is shorter than expected.');
        }
    } catch (error) {
        console.error('Summarizer test failed:', error);
    }
}

async function runAll() {
    await testTruncation();
    await testSummarizerDetailedContent();
}

runAll().catch(console.error);
