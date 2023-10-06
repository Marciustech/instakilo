import { Module } from "@nestjs/common";
import { AuthService } from "src/common/auth/auth.service";
import { GatewayController } from "./api_gateway.controller";
import { JwtModule } from "@nestjs/jwt";
import {
  UserService,
  PostModule,
  CommentService,
  LikesService,
  ChatModule,
  ChatService,
  ChatDatabaseModule,
  ChatDatabaseService,
  CommentModule,
  FeedModule,
  LikesModule,
  UserModule,
} from "../modules/index";
import { ApiGatewayService } from "./api_gateway.service";
import { AuthModule } from "src/common/auth/auth.module";
import { MongooseModule } from "@nestjs/mongoose";
import { PrometheusModule } from "@willsoto/nestjs-prometheus";

@Module({
  imports: [
    JwtModule.register({}),
    MongooseModule.forRoot(process.env.MONGO_URI),
    /*PrometheusModule.register({
      controller: GatewayController,
    }),*/
    AuthModule,
    UserModule,
    CommentModule,
    FeedModule,
    LikesModule,
    PostModule,
    ChatModule,
  ],
  controllers: [GatewayController],
  providers: [
    AuthService,
    UserService,
    CommentService,
    LikesService,
    ApiGatewayService,
    ChatService,
    ChatDatabaseService,
  ],
})
export class ApiGatewayModule {}
