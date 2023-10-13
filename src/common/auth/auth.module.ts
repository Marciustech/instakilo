import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy, RJwtStrategy } from "./strategy";
import { ClientProxyFactory } from "@nestjs/microservices/client";
import { Transport } from "@nestjs/microservices/enums";

@Module({
  imports: [JwtModule.register({})],
  providers: [AuthService, JwtStrategy, RJwtStrategy, {
    provide: "USER_SERVICE",
    useFactory: () =>
      ClientProxyFactory.create({
        transport: Transport.TCP,
        options: {
          host: "0.0.0.0",
          port: 8080,
        },
      }),
  },],
})
export class AuthModule {}
