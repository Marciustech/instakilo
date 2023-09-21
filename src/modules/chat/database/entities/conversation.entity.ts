import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { MessageEntity } from "./index";

@Entity()
export class ConversationEntity {
  @PrimaryGeneratedColumn("uuid")
  conversationId: string;

  @Column("json")
  participants: string[];

  @OneToMany(() => MessageEntity, (message) => message.conversation)
  messages: MessageEntity[];

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createAt: Date;
}
