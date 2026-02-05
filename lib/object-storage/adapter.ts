import { minioStorageAdapter } from './minio-adapter';
import { ObjectStorageAdapter } from './types';

export const objectStorage: ObjectStorageAdapter = minioStorageAdapter;
