import { Readable } from 'stream';

export interface ObjectStorageAdapter {
  uploadFile(bucket: string, key: string, data: Buffer, contentType: string): Promise<string>;
  uploadStream(bucket: string, key: string, stream: Readable, contentType: string, size?: number): Promise<string>;
  getPresignedUrl(bucket: string, key: string, expiresIn?: number): Promise<string>;
  deleteFile(bucket: string, key: string): Promise<void>;
  ensureBucket(bucket: string): Promise<void>;
}
