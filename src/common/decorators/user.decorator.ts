import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Socket } from "socket.io";

export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    if (ctx.getType() !== "http") {
      const request = ctx.switchToHttp().getRequest();
      const user = request.user;
      return data ? user?.[data] : user;
    }
    if (ctx.getType() !== "ws") {
      const client: Socket = ctx.switchToWs().getClient();
      const { authorization } = client.handshake.headers;
      return authorization;
    }
  },
);
