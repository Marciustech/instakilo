import { Module } from "@nestjs/common";
import { ChatDatabaseService } from "./database.service";

@Module({
  providers: [ChatDatabaseService],
})
export class ChatDatabaseModule {}
