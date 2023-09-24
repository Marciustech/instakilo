import { Module } from "@nestjs/common";
import { ChatDatabaseModule } from "./database/database.module";
import { ChatGateway } from "./chat.gateway";
import { ChatService } from "./chat.service";
import { OnlineUsersModule } from "./online/online-users.module";
import { OnlineUsersService } from "./online/online-users.service";
import { ChatDatabaseService } from "./database/database.service";

@Module({
  imports: [ChatDatabaseModule, OnlineUsersModule],
  providers: [
    ChatGateway,
    ChatService,
    OnlineUsersService,
    ChatDatabaseService,
  ],
})
export class ChatModule {}
