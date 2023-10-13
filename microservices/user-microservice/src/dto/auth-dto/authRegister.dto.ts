import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class RegistrationDto {
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: "Create your unique username",
    example: "elena_muskito",
  })
  username: string;
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    type: String,
    description: "Insert your email address",
    example: "conquering_aliens@spacez.com",
  })
  email: string;
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: "Create a safe password",
    example: "ThisPasswordIsSaferThanMyTezla",
  })
  password: string;
}
