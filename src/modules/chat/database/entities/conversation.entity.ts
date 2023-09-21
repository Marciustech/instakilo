import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { MessageEntity } from "./index";

@Entity()
export class ConversationEntity {
  @PrimaryGeneratedColumn("uuid")
  conversationId: string;

  @Column({ type: "json" })
  participants: string[];

  @OneToMany(() => MessageEntity, (MessageEntity) => MessageEntity.conversation)
  messages: MessageEntity[];

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createAt: Date;
}
