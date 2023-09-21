import { IsNotEmpty, IsString } from "class-validator";

export class MessageDto {
  @IsString()
  @IsNotEmpty()
  senderId: string;
  @IsString()
  @IsNotEmpty()
  recipientId: string;
  @IsString()
  conversationId: string;
  @IsString()
  @IsNotEmpty()
  message: string;
}
