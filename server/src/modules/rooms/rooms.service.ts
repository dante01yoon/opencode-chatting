import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/db/prisma.service';

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  async listRooms() {
    const rooms = await this.prisma.room.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { members: true } } },
    });

    return rooms.map((room) => ({
      id: room.id,
      name: room.name,
      createdAt: room.createdAt,
      memberCount: room._count.members,
    }));
  }

  async createRoom(name: string, userId: string) {
    return this.prisma.room.create({
      data: {
        name,
        members: {
          create: {
            userId,
          },
        },
      },
    });
  }

  async ensureRoom(roomId: string) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return room;
  }

  async ensureMember(roomId: string, userId: string) {
    const membership = await this.prisma.roomMember.findUnique({
      where: {
        roomId_userId: {
          roomId,
          userId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('Not a member of this room');
    }

    return membership;
  }

  async joinRoom(roomId: string, userId: string) {
    await this.ensureRoom(roomId);

    await this.prisma.roomMember.upsert({
      where: {
        roomId_userId: {
          roomId,
          userId,
        },
      },
      create: {
        roomId,
        userId,
      },
      update: {},
    });
  }

  async leaveRoom(roomId: string, userId: string) {
    await this.prisma.roomMember.deleteMany({
      where: {
        roomId,
        userId,
      },
    });
  }
}
