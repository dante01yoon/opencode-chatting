import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { ServerOptions } from 'socket.io';
import { createRedisClient } from '../redis/redis.client';
import { SocketMiddleware } from '../session/ws-session.middleware';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor?: ReturnType<typeof createAdapter>;

  constructor(
    app: INestApplicationContext,
    private readonly redisUrl: string,
    private readonly sessionMiddleware: SocketMiddleware,
  ) {
    super(app);
  }

  async connectToRedis() {
    const pubClient = createRedisClient(this.redisUrl);
    const subClient = pubClient.duplicate();
    await Promise.all([pubClient.connect(), subClient.connect()]);
    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions) {
    const server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: process.env.CLIENT_URL ?? 'http://localhost:3000',
        credentials: true,
      },
    });

    server.use(this.sessionMiddleware);

    if (this.adapterConstructor) {
      server.adapter(this.adapterConstructor);
    }

    return server;
  }
}
