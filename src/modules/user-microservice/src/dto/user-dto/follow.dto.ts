import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class FollowUserDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    description: "The username of the user to follow",
  })
  username: string;
}
