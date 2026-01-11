import { IsString, MaxLength, MinLength } from 'class-validator';

export class JoinRoomDto {
  @IsString()
  roomId!: string;
}

export class LeaveRoomDto {
  @IsString()
  roomId!: string;
}

export class SendMessageDto {
  @IsString()
  roomId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  content!: string;
}

export class CreateRoomSocketDto {
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  name!: string;
}
