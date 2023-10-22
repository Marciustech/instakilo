import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { UserService } from "./user.service";
import { JsonParsePipe } from "./pipes/index";

@Controller()
export class UserController {
  constructor(private userService: UserService) {}

  @MessagePattern("signup")
  async signup_message(@Payload(JsonParsePipe) data: any): Promise<any> {
    console.log("[signup data] " + typeof data);
    const create_user_response = await this.userService.createUser(data);
    return create_user_response;
  }

  @MessagePattern("findUser")
  async login_message(@Payload(JsonParsePipe) data: any) {
    return await this.userService.findOneUser(data);
  }

  @MessagePattern("store_refresh_token")
  async store_refresh_token_message(@Payload(JsonParsePipe) data: any) {
    return await this.userService.storeRefreshToken(data.id, data.hashRT);
  }

  @MessagePattern("logout")
  async logout_message(@Payload(JsonParsePipe) data: any) {
    return (await this.userService.logout(data))
      ? { message: "Successfully logged out" }
      : { message: "Already logged out" };
  }
}
