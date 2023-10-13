import { IsNotEmpty, IsString } from "class-validator";

export class LoggedUserDto {
  @IsNotEmpty()
  @IsString()
  username: string;
}
