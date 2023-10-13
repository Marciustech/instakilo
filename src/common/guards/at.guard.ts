import {
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthGuard } from "@nestjs/passport";

export class AtGuard extends AuthGuard("jwt") {
  constructor() {
    super();
  }
}
