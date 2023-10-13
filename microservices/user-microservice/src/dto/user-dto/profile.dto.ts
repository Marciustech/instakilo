import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsUrl } from "class-validator";

export class ProfileUpdateDto {
  @IsString()
  @ApiProperty({
    type: String,
    description: "Profile Bio",
  })
  bio: string;
  @IsString()
  @IsUrl()
  @ApiProperty({
    type: String,
    description: "Profile picture URL",
  })
  photo_url: string;
}
