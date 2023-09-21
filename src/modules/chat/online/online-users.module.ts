import { Module } from "@nestjs/common";
import { OnlineUsersService } from "./online-users.service";

@Module({
  imports: [],
  providers: [OnlineUsersService],
})
export class OnlineUsersModule {}
