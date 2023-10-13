import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserPrismaModule } from "../user-prisma/user-prisma.module";
import { UserController } from "./user.controller";

@Module({
  imports: [UserPrismaModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
