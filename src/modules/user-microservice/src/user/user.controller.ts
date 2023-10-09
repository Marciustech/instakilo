import { Controller } from "@nestjs/common";
import { EventPattern, Payload, Ctx, NatsContext } from "@nestjs/microservices";

@Controller()
export class UserController {
    constructor(){}

    @EventPattern("signup")
    signup_message(@Payload() data: any, @Ctx() context: NatsContext) {
    console.log("[user service]:");
    console.log(context.getSubject());
    console.log(data);
    return "successful";
  }
}