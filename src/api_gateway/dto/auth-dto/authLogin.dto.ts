import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({ type: String, description: "Insert your registered email" })
  email: string;
  @IsNotEmpty()
  @ApiProperty({ type: String, description: "Insert your registered password" })
  password: string;
}
