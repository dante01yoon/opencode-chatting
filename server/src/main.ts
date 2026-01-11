import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { RedisStore } from 'connect-redis';
import { AppModule } from './app.module';
import { createRedisClient } from './infra/redis/redis.client';
import { RedisIoAdapter } from './infra/ws/redis-io-adapter';
import { createSocketSessionMiddleware } from './infra/session/ws-session.middleware';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:3000';
  const port = Number(process.env.PORT ?? 3001);
  const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';
  const sessionSecret = process.env.SESSION_SECRET ?? 'dev-secret';
  const isProd = process.env.NODE_ENV === 'production';

  app.getHttpAdapter().getInstance().set('trust proxy', 1);
  app.enableCors({
    origin: clientUrl,
    credentials: true,
  });

  const redisClient = createRedisClient(redisUrl);
  await redisClient.connect();
  const sessionStore = new RedisStore({
    client: redisClient,
  });

  app.use(cookieParser(sessionSecret));
  app.use(
    session({
      store: sessionStore,
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      name: 'connect.sid',
      cookie: {
        httpOnly: true,
        sameSite: isProd ? 'none' : 'lax',
        secure: isProd,
        maxAge: 1000 * 60 * 60 * 24 * 7,
      },
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const sessionMiddleware = createSocketSessionMiddleware(sessionStore, sessionSecret);
  const adapter = new RedisIoAdapter(app, redisUrl, sessionMiddleware);
  await adapter.connectToRedis();
  app.useWebSocketAdapter(adapter);

  await app.listen(port);
}
bootstrap();
