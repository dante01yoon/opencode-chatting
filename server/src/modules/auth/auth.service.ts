import { Injectable } from '@nestjs/common';
import { SessionData } from 'express-session';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../infra/db/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async upsertSessionUser(session: SessionData, nickname?: string) {
    const trimmedNickname = nickname?.trim();

    if (!session.userId) {
      const initialNickname = trimmedNickname ?? `Guest-${randomUUID().slice(0, 8)}`;
      const user = await this.prisma.user.create({
        data: {
          nickname: initialNickname,
        },
      });

      session.userId = user.id;
      session.nickname = user.nickname;

      return {
        userId: user.id,
        nickname: user.nickname,
      };
    }

    if (!session.nickname) {
      const user = await this.prisma.user.findUnique({
        where: { id: session.userId },
        select: { nickname: true },
      });
      if (user?.nickname) {
        session.nickname = user.nickname;
      }
    }

    if (trimmedNickname && trimmedNickname !== session.nickname) {
      await this.prisma.user.update({
        where: { id: session.userId },
        data: { nickname: trimmedNickname },
      });
      session.nickname = trimmedNickname;
    }

    return {
      userId: session.userId,
      nickname: session.nickname ?? trimmedNickname ?? 'Guest',
    };
  }
}
