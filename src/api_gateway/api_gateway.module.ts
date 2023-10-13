import { Module } from "@nestjs/common";
import { AuthService } from "src/common/auth/auth.service";
import { GatewayController } from "./api_gateway.controller";
import { JwtModule } from "@nestjs/jwt";
import {
  PostModule,
  CommentService,
  LikesService,
  ChatModule,
  ChatService,
  ChatDatabaseService,
  CommentModule,
  FeedModule,
  LikesModule,
} from "../modules/index";
import { ApiGatewayService } from "./api_gateway.service";
import { AuthModule } from "src/common/auth/auth.module";
import { MongooseModule } from "@nestjs/mongoose";
import { PrometheusModule } from "@willsoto/nestjs-prometheus";
import {
  ClientProxyFactory,
  ClientsModule,
  Transport,
} from "@nestjs/microservices";

@Module({
  imports: [
    JwtModule.register({}),
    MongooseModule.forRoot(
      process.env.MONGO_URL || "mongodb://localhost:27017",
    ),
    PrometheusModule.register({
      pushgateway: {
        url: `http://localhost:${process.env.PORT}`,
      },
    }),
    AuthModule,
    //CommentModule,
    //FeedModule,
    //LikesModule,
    //PostModule,
    //ChatModule,
  ],
  controllers: [GatewayController],
  providers: [
    {
      provide: "USER_SERVICE",
      useFactory: () =>
        ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            host: "0.0.0.0",
            port: 8080,
          },
        }),
    },
    AuthService,
    //CommentService,
    //LikesService,
    //ApiGatewayService,
    //ChatService,
    //ChatDatabaseService,
  ],
})
export class ApiGatewayModule {}
