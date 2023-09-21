import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { PostService } from "./post.service";
import { Post, PostSchema } from "./schemas/post.schema";
import { PostResolver } from "./post.resolver";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { join } from "path";
@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(
        process.cwd(),
        "src/modules/post/graphql/schema.gql",
      ),
    }),
    MongooseModule.forRoot("mongodb://localhost:27017"),
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
  ],
  providers: [PostService, PostResolver],
  exports: [PostService],
})
export class PostModule {}
