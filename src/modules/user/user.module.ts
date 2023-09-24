import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserPrismaModule } from "./user-prisma/user-prisma.module";

@Module({
  imports: [UserPrismaModule],
  providers: [UserService],
})
export class UserModule {}
