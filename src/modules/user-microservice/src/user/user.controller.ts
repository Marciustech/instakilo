import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { UserService } from "./user.service";
import { RegistrationDto } from "../dto/auth-dto";

@Controller()
export class UserController {
  constructor(private userService: UserService) {}

  @MessagePattern("signup")
  async signup_message(@Payload() data: RegistrationDto): Promise<any> {
    return this.userService.createUser(data);
  }

  @MessagePattern("findUser")
  async login_message(@Payload() data: any) {
    return this.userService.findOneUser(data)
  }
}
