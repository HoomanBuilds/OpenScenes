import Redis from 'ioredis';

const connectionUrl = (process.env.REDIS_URL || 'redis://127.0.0.1:6379').replace('localhost', '127.0.0.1');

const redis = new Redis(connectionUrl, {
  maxRetriesPerRequest: null,
  connectTimeout: 10000,
});

export { redis };
