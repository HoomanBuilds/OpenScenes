import fs from 'fs';
import path from 'path';

export interface StorageAdapter {
    init(): Promise<void>;
    getNextRenderId(): Promise<number>;
    saveRenderLog(renderId: number, content: string): Promise<string>;
}

class FileSystemAdapter implements StorageAdapter {
    private baseDir: string;
    private metadataPath: string;
    private logsDir: string;

    constructor() {
        this.baseDir = path.join(process.cwd(), 'generate-logs');
        this.logsDir = path.join(this.baseDir, 'renders');
        this.metadataPath = path.join(this.baseDir, 'metadata.json');
    }

    async init() {
        if (!fs.existsSync(this.baseDir)) {
            fs.mkdirSync(this.baseDir, { recursive: true });
        }
        if (!fs.existsSync(this.logsDir)) {
            fs.mkdirSync(this.logsDir, { recursive: true });
        }
        if (!fs.existsSync(this.metadataPath)) {
            fs.writeFileSync(this.metadataPath, JSON.stringify({ count: 0 }, null, 2));
        }
    }

    async getNextRenderId(): Promise<number> {
        await this.init(); 
        
        try {
            const data = JSON.parse(fs.readFileSync(this.metadataPath, 'utf-8'));
            const nextId = (data.count || 0) + 1;
            
            fs.writeFileSync(this.metadataPath, JSON.stringify({ count: nextId }, null, 2));
            
            return nextId;
        } catch (e) {
            console.error('Failed to update render count', e);
            return -1; 
        }
    }

    async saveRenderLog(renderId: number, content: string): Promise<string> {
        await this.init();
        const filename = `render-${renderId}.log`;
        const filePath = path.join(this.logsDir, filename);
        
        fs.writeFileSync(filePath, content);
        return filePath;
    }
}

export const storage = new FileSystemAdapter();
