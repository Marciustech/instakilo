import { Module } from "@nestjs/common";
import { AuthModule } from "./common/auth/auth.module";
import {
  UserModule,
  UserPrismaModule,
  LikesModule,
  CommentModule,
  PostModule,
  FeedModule,
  StoriesModule,
  ChatModule,
} from "./modules/index";
import { ApiGatewayModule } from "./api_gateway/api_gateway.module";

@Module({
  imports: [
    AuthModule,
    UserModule,
    CommentModule,
    FeedModule,
    ApiGatewayModule,
    UserPrismaModule,
    LikesModule,
    PostModule,
    AppModule,
    ChatModule,
  ],
})
export class AppModule {}
