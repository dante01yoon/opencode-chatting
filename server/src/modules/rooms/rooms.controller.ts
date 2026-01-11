import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { SessionGuard } from '../auth/session.guard';
import { CreateRoomDto } from './rooms.dto';
import { RoomsService } from './rooms.service';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  async listRooms() {
    return this.roomsService.listRooms();
  }

  @UseGuards(SessionGuard)
  @Post()
  async createRoom(@Req() req: Request, @Body() dto: CreateRoomDto) {
    const room = await this.roomsService.createRoom(dto.name.trim(), req.session.userId!);
    return {
      id: room.id,
      name: room.name,
      createdAt: room.createdAt,
    };
  }
}
