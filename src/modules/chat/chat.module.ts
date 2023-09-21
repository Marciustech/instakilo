import { Module } from "@nestjs/common";
import { MessageModule } from "./message/message.module";
import { ChatDatabaseModule } from "./database/database.module";
import { ChatGateway } from "./chat.gateway";
import { ChatService } from "./chat.service";
import { ChatDatabaseService } from "./database/database.service";
import { OnlineUsersModule } from "./online/online-users.module";
import { OnlineUsersService } from "./online/online-users.service";

@Module({
  imports: [MessageModule, ChatDatabaseModule, OnlineUsersModule],
  providers: [
    ChatGateway,
    ChatService,
    ChatDatabaseService,
    OnlineUsersService,
  ],
})
export class ChatModule {}
