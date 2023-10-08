import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";
import { Socket } from "socket.io";

export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    if (ctx.getType() === "http") {
      const request: Request = ctx.switchToHttp().getRequest();
      const user = request.user;
      const userResponse = data ? user?.[data] : user;
      return userResponse;
    }
    if (ctx.getType() === "ws") {
      const client: Socket = ctx.switchToWs().getClient();
      const { authorization } = client.handshake.headers;
      return authorization;
    }
  },
);
