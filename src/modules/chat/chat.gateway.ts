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
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.request.headers.user}`);

    const userId: string = client.request.headers.user as string;

    this.onlineService.setUserOffline(userId);
  }

  //@UseGuards(AtGuard)
  @SubscribeMessage("dm")
  async handlePrivateMessage(
    //@User() user: any,
    @ConnectedSocket() client: Socket,
    @MessageBody() data: MessageDto,
  ) {
    await this.deliverMessage(client, data);
  }

  private async deliverMessage(
    client: Socket,
    data: MessageDto,
  ): Promise<Boolean> {
    if (data.conversationId) {
      if (this.onlineService.isUserOnline(data.recipientId)) {
        //TODO implement offline message sending
        throw new Error("Not Implemented offline message sending");
      }
      if (client.to(data.conversationId).emit("dm", data)) {
        this.storeMessage(data.conversationId, data);
        return;
      }
    }

    const newConversationId = (await this.chatService.createConversation(data))
      .conversationId;

    await this.connectToNewConversation(
      client,
      data.recipientId,
      newConversationId,
    );

    const isSentSuccessfully = client.to(newConversationId).emit("dm", data);

    if (isSentSuccessfully) {
      this.storeMessage(newConversationId, data);
    }
  }

  private storeMessage(conversationId: string, data: MessageDto) {
    this.chatService.storeMessage(conversationId, data);
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
    for (let conversation of conversations) {
      client.join(conversation);
    }
  }

  private async connectToNewConversation(
    client: Socket,
    recipient: string,
    newConversationId: string,
  ): Promise<boolean> {
    client.join(newConversationId);
    if (this.onlineService.isUserOnline(recipient)) {
      const recipientSocketId: string =
        await this.onlineService.getUserSocketId(recipient);
      //TODO find socket by id and add to the room based on redis query
      const sockets = await this.server.fetchSockets();
      let recipientSocket: any;
      for (let socket of sockets) {
        if (socket.id === recipientSocketId) {
          recipientSocket = socket;
        }
      }
      recipientSocket.join(newConversationId);
      return true;
    }
    return false;
  }
}
