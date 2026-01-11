import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/db/prisma.service';
import { RoomsService } from '../rooms/rooms.service';

const RETENTION_LIMIT = 100;

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly roomsService: RoomsService,
  ) {}

  async getRoomMessages(roomId: string, userId: string) {
    await this.roomsService.ensureMember(roomId, userId);

    const messages = await this.prisma.message.findMany({
      where: { roomId },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: RETENTION_LIMIT,
      include: { user: { select: { nickname: true } } },
    });

    return messages
      .reverse()
      .map((message) => ({
        id: message.id,
        roomId: message.roomId,
        userId: message.userId,
        nickname: message.user.nickname,
        content: message.content,
        createdAt: message.createdAt,
      }));
  }

  async createMessage(roomId: string, userId: string, content: string) {
    await this.roomsService.ensureMember(roomId, userId);

    const message = await this.prisma.message.create({
      data: {
        roomId,
        userId,
        content,
      },
      include: { user: { select: { nickname: true } } },
    });

    await this.enforceRetention(roomId);

    return {
      id: message.id,
      roomId: message.roomId,
      userId: message.userId,
      nickname: message.user.nickname,
      content: message.content,
      createdAt: message.createdAt,
    };
  }

  private async enforceRetention(roomId: string) {
    const threshold = await this.prisma.message.findMany({
      where: { roomId },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: RETENTION_LIMIT,
      take: 1,
      select: { id: true, createdAt: true },
    });

    if (!threshold.length) {
      return;
    }

    const cutoff = threshold[0];

    await this.prisma.message.deleteMany({
      where: {
        roomId,
        OR: [
          { createdAt: { lt: cutoff.createdAt } },
          {
            AND: [
              { createdAt: cutoff.createdAt },
              { id: { lt: cutoff.id } },
            ],
          },
        ],
      },
    });
  }
}
