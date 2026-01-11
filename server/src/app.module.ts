import { Module } from '@nestjs/common';
import { HealthController } from './common/health.controller';
import { DatabaseModule } from './infra/db/db.module';
import { AuthModule } from './modules/auth/auth.module';
import { ChatModule } from './modules/chat/chat.module';
import { RoomsModule } from './modules/rooms/rooms.module';

@Module({
  imports: [DatabaseModule, AuthModule, RoomsModule, ChatModule],
  controllers: [HealthController],
})
export class AppModule {}
