import { rabbitmqAdapter } from './rabbitmq-adapter';
import { QueueAdapter } from './types';

export const queue: QueueAdapter = rabbitmqAdapter;
export * from './types';
