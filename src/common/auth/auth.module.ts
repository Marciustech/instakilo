import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./strategy";
import { RJwtStrategy } from "./strategy/refresh_jwt.strategy";

@Module({
  imports: [JwtModule.register({})],
  providers: [AuthService, JwtStrategy, RJwtStrategy],
})
export class AuthModule {}
