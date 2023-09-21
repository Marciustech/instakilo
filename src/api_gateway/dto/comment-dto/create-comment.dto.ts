import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateCommentDto {
  @IsUUID("all")
  @ApiProperty({
    type: String,
    description: "ID of the post to comment",
    example: "ThisPasswordIsSaferThanMyTesla",
  })
  postId: string;
  @IsUUID("all")
  @ApiProperty({
    type: String,
    description: "ID of the User commenting",
    example: "1c1efdd4-b1df-4054-b74c-4fe48945b252",
  })
  userId: string;
  @IsString()
  @ApiProperty({
    type: String,
    description: "Username of the User commenting",
    example: "elena_muskito",
  })
  username: string;
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    description: "Username of the User commenting",
    example: "I loved the post, please keep up with the amazing job!",
  })
  comment: string;
}
