import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { SessionGuard } from '../auth/session.guard';
import { ChatService } from './chat.service';

@Controller('rooms')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(SessionGuard)
  @Get(':roomId/messages')
  async getMessages(@Req() req: Request, @Param('roomId') roomId: string) {
    return this.chatService.getRoomMessages(roomId, req.session.userId!);
  }
}
