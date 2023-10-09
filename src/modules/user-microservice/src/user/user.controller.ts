import { Controller } from "@nestjs/common";
import { Ctx, MessagePattern, NatsContext, Payload } from "@nestjs/microservices";

@Controller()
export class UserController {
    constructor(){}

    @MessagePattern("signup")
    async signup_message(@Payload() data: any, @Ctx() ctx: NatsContext): Promise<any> {
    console.log("[user service]:");
    console.log(data);
    return ctx.getSubject();
  }
}