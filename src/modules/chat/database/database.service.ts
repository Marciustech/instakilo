// riak.service.ts
import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { DataSource } from "typeorm";
import { MessageDto } from "../dto";
import { ConversationEntity, MessageEntity } from "./entities";

@Injectable()
export class ChatDatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly db: DataSource;

  constructor() {
    this.db = new DataSource({
      type: "mysql",
      host: "localhost",
      port: parseInt(process.env.MYSQL_PORT),
      username: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      entities: [ConversationEntity, MessageEntity],
      synchronize: true,
      logging: false,
    });
  }

  async saveMessage(conversationId: string, message: MessageDto) {
    const conversation = await this.db
      .getRepository(ConversationEntity)
      .findOneBy({
        conversationId: conversationId,
      });

    const newMessage = new MessageEntity();
    newMessage.senderId = message.senderId;
    newMessage.recipientId = message.recipientId;
    newMessage.message = message.message;
    newMessage.conversation = conversation;

    const messageRepository = this.db.getRepository(MessageEntity);
    const response = await messageRepository.save(newMessage);
    console.log(response);
    return response;
  }

  async getMessagesByConversationId(conversationId: string) {
    const messageRepository = this.db.getRepository(MessageEntity);
    const messages = await messageRepository
      .createQueryBuilder("messagesByCOnversationId")
      .innerJoin("message.conversation", "conversation")
      .where("conversation.conversationId = :conversationId", {
        conversationId,
      })
      .orderBy("message.createAt", "ASC")
      .getMany();

    return messages;
  }

  async createConversation(message: MessageDto) {
    const conversation = new ConversationEntity();
    conversation.participants = [message.senderId, message.recipientId];

    const conversationRepository = this.db.getRepository(ConversationEntity);
    const savedConversation = await conversationRepository.save(conversation);
    console.log("Conversation created:", savedConversation);
    return savedConversation;
  }

  async getConversationsByUserId(
    userId: string,
  ): Promise<ConversationEntity[]> {
    const conversationRepository = this.db.getRepository(ConversationEntity);

    const conversations = await conversationRepository
      .createQueryBuilder("conversation")
      .where("JSON_CONTAINS(participants, :userId)", {
        userId: JSON.stringify(userId),
      })
      .getMany();

    return conversations;
  }

  async conversationExistsForUsers(userId1: string, userId2: string) {
    const conversationRepository = this.db.getRepository(ConversationEntity);

    const conversation = await conversationRepository
      .createQueryBuilder("conversation")
      .where("JSON_SEARCH(participants, 'one', :userId1) IS NOT NULL", {
        userId1,
      })
      .andWhere("JSON_SEARCH(participants, 'one', :userId2) IS NOT NULL", {
        userId2,
      })
      .getOne();

    return conversation;
  }

  async getAll() {
    const messageRepository = this.db.getRepository(MessageEntity);

    return await messageRepository
      .createQueryBuilder("message")
      .innerJoin("message.conversation", "conversation")
      .addSelect(["conversation.conversationId", "conversation.participants"])
      .getMany();
  }

  async onModuleInit() {
    try {
      await this.db.initialize();
    } catch (error) {
      console.log(error);
    }
  }

  async onModuleDestroy() {
    try {
      await this.db.destroy();
    } catch (error) {
      console.log(error);
    }
  }
}
