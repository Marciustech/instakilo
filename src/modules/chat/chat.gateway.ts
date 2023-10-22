import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { MessageDto } from "./dto/message.dto";
import { ChatService } from "./chat.service";
import { UseGuards } from "@nestjs/common";
import { AtGuard, User } from "src/common";
import { OnlineUsersService } from "./online/online-users.service";

@WebSocketGateway(9000, { namespace: "private" })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private chatService: ChatService,
    private readonly onlineService: OnlineUsersService,
  ) {}
  @WebSocketServer() server: Server;

  //TODO: Make sender the authenticated user instead of client.request.headers.user
  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.request.headers.user}`);
    console.log(await this.chatService.getAll());

    const userId: string = client.request.headers.user as string;
    const socketId: string = client.id;

    this.onlineService.setUserOnline(userId, socketId);
    this.connectToExistingConversations(client, userId);
    await this.onlineService.logAllStatus();
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.request.headers.user}`);

    const userId: string = client.request.headers.user as string;
    this.onlineService.setUserOffline(userId);
    await this.onlineService.logAllStatus();
  }

  //@UseGuards(AtGuard)
  @SubscribeMessage("dm")
  async handlePrivateMessage(
    //@User() user: any,
    @ConnectedSocket() client: Socket,
    @MessageBody() data: MessageDto,
  ) {
    if (this.onlineService.isUserOnline(data.recipientId)) {
      return await this.deliverOnlineMessage(client, data);
    }

    if (!this.onlineService.isUserOnline(data.recipientId)) {
      return await await this.deliverOfflineMessage(data);
    }
  }
  private async deliverOfflineMessage(data: MessageDto) {
    throw new Error("Method not implemented.");
  }

  private async deliverOnlineMessage(client: Socket, data: MessageDto) {
    const conversation =
      await this.chatService.conversationExistsForUsers(data);
    if (!conversation) {
      data.conversationId = await this.handleNewConversation(client, data);
    }

    client.to(conversation.conversationId).emit("dm", data);
    this.chatService.storeMessage(data.conversationId, data);
  }
  private async handleNewConversation(
    client: Socket,
    data: MessageDto,
  ): Promise<string> {
    console.log(typeof data);
    const newConversation = await this.chatService.createConversation(data);

    await this.connectToNewConversation(
      client,
      data.recipientId,
      newConversation.conversationId,
    );

    return newConversation.conversationId;
  }

  private async connectToExistingConversations(
    client: Socket,
    userId: string,
  ): Promise<void> {
    const conversations =
      await this.chatService.getConversationsByUserId(userId);
    if (!conversations) {
      return;
    }
    for (const conversation of conversations) {
      console.log(
        `Connecting user ${userId} to Conversation ${conversation.conversationId}`,
      );
      client.join(conversation.conversationId);
    }
  }

  //find online socket of online user and join it to conversation room
  private async connectToNewConversation(
    client: Socket,
    recipient: string,
    newConversationId: string,
  ) {
    client.join(newConversationId);
    const recipientSocketId: string =
      await this.onlineService.getUserSocketId(recipient);

    const sockets = await this.server.fetchSockets();
    let recipientSocket: any;
    for (const socket of sockets) {
      if (socket.id === recipientSocketId) {
        recipientSocket = socket;
      }
    }
    recipientSocket.join(newConversationId);
    return true;
  }
}
