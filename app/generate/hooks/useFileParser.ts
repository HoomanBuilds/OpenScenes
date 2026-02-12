import { useState, useCallback } from 'react';
import type { RawFile } from '../types';
import { limits } from '@/lib/config/limits';
import { showAIError } from '@/lib/utils/sonner';

const MAX_CONTENT_LENGTH = 500000;

export function useFileParser() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const parseFile = useCallback(async (file: File): Promise<RawFile | null> => {
        setIsProcessing(true);
        setError(null);

        try {
            const allowedExtensions = Array.from(limits.validation.allowedFormats);
            const ext = file.name.split('.').pop()?.toLowerCase();

            if (!(allowedExtensions as any[]).includes(ext || '')) {
                const errorMsg = `Unsupported file type. Allowed: ${allowedExtensions.join(', ')}`;
                setError(errorMsg);
                showAIError(errorMsg);
                setIsProcessing(false);
                return null;
            }

            if (file.size > limits.validation.maxFileSize) {
                const errorMsg = `File too large. Max ${limits.validation.maxFileSize / (1024 * 1024)}MB.`;
                setError(errorMsg);
                showAIError(errorMsg);
                setIsProcessing(false);
                return null;
            }

            const content = await readFileContent(file);
            const isTruncated = content.length > MAX_CONTENT_LENGTH;
            const finalContent = isTruncated 
                ? content.slice(0, MAX_CONTENT_LENGTH) + '\n...[content truncated by frontend]'
                : content;

            const rawFile: RawFile = {
                id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                fileName: file.name,
                fileType: file.type || `text/${ext}`,
                content: finalContent,
                charCount: finalContent.length,
                isTruncated
            };

            setIsProcessing(false);
            return rawFile;
        } catch (err) {
            console.error('[FileParser] Parser error:', err);
            setError(err instanceof Error ? err.message : 'Failed to parse file');
            setIsProcessing(false);
            return null;
        }
    }, []);

    const parseMultipleFiles = useCallback(async (files: File[]): Promise<RawFile[]> => {
        const results: RawFile[] = [];
        for (const file of files) {
            const parsed = await parseFile(file);
            if (parsed) {
                results.push(parsed);
            }
        }
        return results;
    }, [parseFile]);

    return {
        parseFile,
        parseMultipleFiles,
        isProcessing,
        error
    };
}

async function readFileContent(file: File): Promise<string> {
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        return extractPdfText(file);
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result;
            if (typeof result === 'string') {
                resolve(result);
            } else {
                reject(new Error('Failed to read file as text'));
            }
        };
        reader.onerror = () => reject(new Error('File read failed'));
        reader.readAsText(file);
    });
}

async function extractPdfText(file: File): Promise<string> {
    try {
        // Load pdfjs-dist dynamically to avoid SSR issues if used in other contexts
        const pdfjs = await import('pdfjs-dist');
        // Set worker (needed for pdfjs)
        // Use unpkg for more reliable version matching for v5+
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(' ');
            fullText += pageText + '\n\n';
        }

        return fullText;
    } catch (err) {
        console.error('[PDFParser] Error extracting text:', err);
        throw new Error('Failed to extract text from PDF. Ensure it\'s not password protected.');
    }
}
