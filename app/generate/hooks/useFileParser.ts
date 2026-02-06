import { useState, useCallback } from 'react';
import type { RawFile } from '../types';

const MAX_CONTENT_LENGTH = 10000;

export function useFileParser() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const parseFile = useCallback(async (file: File): Promise<RawFile | null> => {
        setIsProcessing(true);
        setError(null);

        try {
            const allowedTypes = [
                'text/plain',
                'text/markdown',
                'text/csv',
                'application/json',
                'text/html',
                'application/pdf'
            ];

            const ext = file.name.split('.').pop()?.toLowerCase();
            const allowedExtensions = ['txt', 'md', 'csv', 'json', 'html', 'pdf'];

            if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(ext || '')) {
                setError('Unsupported file type. Use txt, md, csv, json, or html.');
                setIsProcessing(false);
                return null;
            }

            if (file.size > 5 * 1024 * 1024) {
                setError('File too large. Max 5MB.');
                setIsProcessing(false);
                return null;
            }

            const content = await readFileContent(file);
            const isTruncated = content.length > MAX_CONTENT_LENGTH;
            const truncatedContent = isTruncated 
                ? content.slice(0, MAX_CONTENT_LENGTH) + '\n...[content truncated]'
                : content;

            const rawFile: RawFile = {
                id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                fileName: file.name,
                fileType: file.type || `text/${ext}`,
                content: truncatedContent,
                charCount: truncatedContent.length,
                isTruncated
            };

            setIsProcessing(false);
            return rawFile;
        } catch (err) {
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
