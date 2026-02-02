import { localStorageAdapter } from './local-adapter';
import { StorageAdapter } from './types';

export const storage: StorageAdapter = localStorageAdapter;
