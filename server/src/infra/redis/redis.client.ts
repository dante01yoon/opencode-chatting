import { createClient } from 'redis';

export const createRedisClient = (url: string) =>
  createClient({
    url,
  });
