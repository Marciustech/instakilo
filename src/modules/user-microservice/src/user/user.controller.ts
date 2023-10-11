import { Controller } from "@nestjs/common";
import { Ctx, MessagePattern, Payload, TcpContext } from "@nestjs/microservices";

@Controller()
export class UserController {
    constructor(){}

    @MessagePattern("signup")
    async signup_message(@Payload() data: any, @Ctx() ctx: TcpContext): Promise<any> {
    console.log("[user service]:");
    console.log(data);
    return data;
  }
}