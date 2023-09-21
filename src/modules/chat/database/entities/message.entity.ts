import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { ConversationEntity } from "./index";

@Entity()
export class MessageEntity {
  @PrimaryGeneratedColumn("uuid")
  messageId: string;

  @Column("uuid")
  senderId: string;

  @Column("uuid")
  recipientId: string;

  @Column({ type: "varchar", length: 250 })
  message: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createAt: Date;

  @Column({ type: "boolean", default: false })
  isViewed: boolean;

  @ManyToOne(() => ConversationEntity, (conversation) => conversation.messages)
  conversation: ConversationEntity;
}
