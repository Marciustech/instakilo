import {
  ForbiddenException,
  InternalServerErrorException,
  Injectable,
  BadRequestException,
} from "@nestjs/common";
import { JwtService, JwtSignOptions } from "@nestjs/jwt";
import { TokenPayload, Tokens } from "./types";
import { RegistrationDto, LoginDto } from "../../api_gateway/dto/index";
import * as argon from "argon2";

@Injectable()
export class AuthService {
  private hash_options = {
    timeCost: 3,
    memoryCost: 65536,
    parallelism: 2,
    type: argon.argon2i,
    hashLength: 32,
  };
  
  constructor(
    private jwt: JwtService,
  ) {}

  async signup(dto: RegistrationDto) {
    const hash: string = await this.hashData(dto.password);
    dto.password = hash
    //TODO request createUser to user microservice
  }

  async login(dto: LoginDto) {
    const user = {} as any //TODO request findUser to user microservice

    if (!user) throw new ForbiddenException("User not registered");

    const passwordMatch = await this.verifyHash(dto.password, user.hash);

    if (!passwordMatch) throw new ForbiddenException("Invalid password");

    try {
      const { accessToken, refreshToken } = await this.getTokens({
        uuid: user.id,
        email: user.email,
        username: user.username,
      });

      await this.storeRefreshToken(user.id, refreshToken);

      return {
        message: "User access successful",
        accessToken,
        refreshToken,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async logout(user: any) {
    try {
      //TODO REQUEST LOGOUT TO USER MICROSERVICE

      return {
        message: "Successfully logged out",
      };
    } catch (error) {
      if (error.code == "P2025")
        throw new BadRequestException("User already Logged out");
    }
  }

  private async getTokens(payload: TokenPayload): Promise<Tokens> {
    const jwt_token_options: JwtSignOptions = {
      secret: process.env.JWT_SECRET,
      expiresIn: 60 * 15,
    };
    const jwt_refresh_token_options: JwtSignOptions = {
      secret: process.env.REFRESH_JWT_SECRET,
      expiresIn: 60 * 60 * 24 * 7,
    };

    try {
      const [accessToken, refreshToken] = await Promise.all([
        await this.jwt.signAsync(payload, jwt_token_options),
        await this.jwt.signAsync(payload, jwt_refresh_token_options),
      ]);

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      console.error(error);
    }
  }

  async storeRefreshToken(id: string, refreshToken: string): Promise<void> {
    //TODO request user microservice to store RT
  }

  async refreshToken(dto: any) {
    try {
      const user = {} as any //TODO request find one user

      if (!user) throw new ForbiddenException("No User Found");

      const refresh_token_matches = this.verifyHash(
        dto.refreshToken,
        user.hashedRefreshToken,
      );

      if (!refresh_token_matches) throw new ForbiddenException("Access denied");

      const { accessToken, refreshToken } = await this.getTokens({
        uuid: user.id,
        email: user.email,
        username: user.username,
      });

      await this.storeRefreshToken(user.id, refreshToken);

      return {
        message: "Refreshed Tokens successfully",
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  private async hashData(data: string): Promise<string> {
    return await argon.hash(data, this.hash_options);
  }

  private async verifyHash(
    password: string,
    passwordHash: string,
  ): Promise<boolean> {
    return await argon.verify(passwordHash, password, this.hash_options);
  }
}
