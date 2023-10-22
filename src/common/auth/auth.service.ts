import {
  ForbiddenException,
  InternalServerErrorException,
  Injectable,
  BadRequestException,
  Inject,
} from "@nestjs/common";
import { JwtService, JwtSignOptions } from "@nestjs/jwt";
import { TokenPayload, Tokens } from "./types";
import {
  RegistrationDto,
  LoginDto,
  UniqueUserResponse,
} from "../../api_gateway/dto/index";
import * as argon from "argon2";
import { ClientProxy } from "@nestjs/microservices/client";
import { isObservable } from "rxjs/internal/util/isObservable";

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
    @Inject("USER_SERVICE") private readonly userClient: ClientProxy,
  ) {}

  async signup(dto: RegistrationDto): Promise<RegistrationDto> {
    const hash: string = await this.hashData(dto.password);
    dto.password = hash;
    return dto;
  }

  async login(dto: LoginDto) {
    const user = (
      await (this.observableToPromise(
        this.userClient.send<UniqueUserResponse, string>(
          "findUser",
          JSON.stringify(dto),
        ),
      ) as Promise<UniqueUserResponse[]>)
    )[0];

    if (!user) throw new ForbiddenException("User not registered");

    const passwordMatch = await this.verifyHash(dto.password, user.hash);

    if (!passwordMatch) throw new ForbiddenException("Invalid password");

    try {
      const { accessToken, refreshToken } = await this.getTokens({
        uuid: user.id,
        email: user.email,
        username: user.username,
      });

      const hashedRefreshToken = await this.hashData(refreshToken);

      await this.storeRefreshToken(user.id, hashedRefreshToken);

      return {
        message: "User access successful",
        accessToken,
        refreshToken,
      };
    } catch (error) {
      console.log(error);
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
    try {
      const response = this.userClient.send<any, string>(
        "store_refresh_token",
        JSON.stringify({
          id,
          hashRT: refreshToken,
        }),
      );
      console.log(await this.observableToPromise(response));
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async refreshToken(dto: any, user: any) {
    try {
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

      const hashedRefreshToken = await this.hashData(refreshToken);

      await this.storeRefreshToken(user.id, hashedRefreshToken);

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
    try {
      console.log("password: ", password);
      console.log("passwordHash: ", passwordHash);
      const isMatch = await argon.verify(
        passwordHash,
        password,
        this.hash_options,
      );
      return isMatch;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  private observableToPromise(value: unknown): Promise<unknown> {
    if (!isObservable(value)) {
      throw new TypeError(
        `Expected an \`Observable\`, got \`${typeof value}\``,
      );
    }

    const values = [];

    return new Promise((resolve, reject) => {
      value.subscribe({
        next(value) {
          values.push(value);
        },
        error: reject,
        complete() {
          resolve(values);
        },
      });
    });
  }
}
