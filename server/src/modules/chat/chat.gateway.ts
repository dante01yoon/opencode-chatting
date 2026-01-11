import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WsSessionGuard } from '../auth/ws-session.guard';
import { RoomsService } from '../rooms/rooms.service';
import { ChatService } from './chat.service';
import {
  CreateRoomSocketDto,
  JoinRoomDto,
  LeaveRoomDto,
  SendMessageDto,
} from './chat.dto';

@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URL ?? 'http://localhost:3000',
    credentials: true,
  },
})
@UseGuards(WsSessionGuard)
export class ChatGateway {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly roomsService: RoomsService,
  ) {}

  @SubscribeMessage('room:create')
  async handleCreateRoom(
    @MessageBody() dto: CreateRoomSocketDto,
    @ConnectedSocket() client: Socket,
  ) {
    const room = await this.roomsService.createRoom(dto.name.trim(), client.data.userId);
    client.join(room.id);
    this.server.emit('room:created', {
      id: room.id,
      name: room.name,
      createdAt: room.createdAt,
    });
    this.server.to(room.id).emit('user:join', {
      roomId: room.id,
      userId: client.data.userId,
      nickname: client.data.nickname,
    });

    return {
      id: room.id,
      name: room.name,
      createdAt: room.createdAt,
    };
  }

  @SubscribeMessage('room:join')
  async handleJoinRoom(
    @MessageBody() dto: JoinRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    await this.roomsService.joinRoom(dto.roomId, client.data.userId);
    client.join(dto.roomId);
    this.server.to(dto.roomId).emit('user:join', {
      roomId: dto.roomId,
      userId: client.data.userId,
      nickname: client.data.nickname,
    });

    return { roomId: dto.roomId };
  }

  @SubscribeMessage('room:leave')
  async handleLeaveRoom(
    @MessageBody() dto: LeaveRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    await this.roomsService.leaveRoom(dto.roomId, client.data.userId);
    client.leave(dto.roomId);
    this.server.to(dto.roomId).emit('user:leave', {
      roomId: dto.roomId,
      userId: client.data.userId,
      nickname: client.data.nickname,
    });

    return { roomId: dto.roomId };
  }

  @SubscribeMessage('message:send')
  async handleSendMessage(
    @MessageBody() dto: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.chatService.createMessage(
      dto.roomId,
      client.data.userId,
      dto.content.trim(),
    );

    this.server.to(dto.roomId).emit('message:new', message);

    return message;
  }

  async handleDisconnect(client: Socket) {
    const rooms = Array.from(client.rooms).filter((roomId) => roomId !== client.id);
    await Promise.all(
      rooms.map((roomId) => this.roomsService.leaveRoom(roomId, client.data.userId)),
    );
    rooms.forEach((roomId) => {
      this.server.to(roomId).emit('user:leave', {
        roomId,
        userId: client.data.userId,
        nickname: client.data.nickname,
      });
    });
  }
}
