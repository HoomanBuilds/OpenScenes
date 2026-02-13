import * as Minio from 'minio';
import { ObjectStorageAdapter } from './types';

class MinioStorageAdapter implements ObjectStorageAdapter {
  private client: Minio.Client;
  private publicEndpoint: string;

  constructor() {
    const endpoint = process.env.MINIO_ENDPOINT || '127.0.0.1';
    const port = parseInt(process.env.MINIO_PORT || '9000', 10);
    const useSSL = process.env.MINIO_USE_SSL === 'true';
    
    console.log(`[MinIO] Connecting to ${endpoint}:${port} (SSL: ${useSSL})`);
    
    this.client = new Minio.Client({
      endPoint: endpoint,
      port,
      useSSL,
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    });

    const protocol = useSSL ? 'https' : 'http';
    const publicHost = process.env.MINIO_PUBLIC_ENDPOINT || endpoint;
    this.publicEndpoint = `${protocol}://${publicHost}`;
  }

  async ensureBucket(bucket: string): Promise<void> {
    try {

      const exists = await this.client.bucketExists(bucket);
      if (!exists) {
        console.log(`[MinIO] Bucket ${bucket} does not exist, creating...`);
        await this.client.makeBucket(bucket);
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${bucket}/*`],
            },
          ],
        };
        await this.client.setBucketPolicy(bucket, JSON.stringify(policy));
      }
    } catch (error: any) {
      console.error(`[MinIO] ensureBucket failed: ${error.message}`);
      throw error;
    }
  }

  async uploadFile(bucket: string, key: string, data: Buffer, contentType: string): Promise<string> {
    await this.ensureBucket(bucket);
    await this.client.putObject(bucket, key, data, data.length, {
      'Content-Type': contentType,
    });
    return `${this.publicEndpoint}/${bucket}/${key}`;
  }

  async uploadStream(bucket: string, key: string, stream: import('stream').Readable, contentType: string, size?: number): Promise<string> {
    try {
      await this.ensureBucket(bucket);
      await this.client.putObject(bucket, key, stream, size, {
        'Content-Type': contentType,
      });
      return `${this.publicEndpoint}/${bucket}/${key}`;
    } catch (error: any) {
      console.error(`[MinIO] uploadStream failed: ${error.message}`);
      throw error;
    }
  }

  async getPresignedUrl(bucket: string, key: string, expiresIn: number = 3600): Promise<string> {
    return await this.client.presignedGetObject(bucket, key, expiresIn);
  }

  async deleteFile(bucket: string, key: string): Promise<void> {
    await this.client.removeObject(bucket, key);
  }
}

export const minioStorageAdapter = new MinioStorageAdapter();
