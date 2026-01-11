import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { SessionRequestDto } from './auth.dto';

const saveSession = (session: Request['session']) =>
  new Promise<void>((resolve, reject) => {
    session.save((err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('session')
  async createSession(@Req() req: Request, @Body() dto: SessionRequestDto) {
    const result = await this.authService.upsertSessionUser(req.session, dto.nickname);
    await saveSession(req.session);
    return result;
  }

  @Get('session')
  getSession(@Req() req: Request) {
    if (!req.session?.userId) {
      throw new UnauthorizedException('Session not found');
    }

    return {
      userId: req.session.userId,
      nickname: req.session.nickname,
    };
  }

  @Post('logout')
  async logout(@Req() req: Request) {
    return new Promise<{ ok: true }>((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) {
          reject(err);
          return;
        }
        req.res?.clearCookie('connect.sid');
        resolve({ ok: true });
      });
    });
  }
}
