import { Field, ObjectType } from "@nestjs/graphql";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

@ObjectType()
export class modifyPostDto {
  @Field()
  @ApiPropertyOptional({
    type: String,
    description: "You might insert a new description or send it empty",
    example: "The best workplace is here",
  })
  description?: string;
}
