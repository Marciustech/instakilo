import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy, RJwtStrategy } from "./strategy";

@Module({
  imports: [JwtModule.register({})],
  providers: [AuthService, JwtStrategy, RJwtStrategy],
})
export class AuthModule {}
