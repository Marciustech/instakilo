import {
  ForbiddenException,
  InternalServerErrorException,
  Injectable,
  BadRequestException,
} from "@nestjs/common";
import { UserPrismaService } from "../../modules/user/user-prisma/user-prisma.service";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { JwtService, JwtSignOptions } from "@nestjs/jwt";
import { TokenPayload, Tokens } from "./types";
import { RegistrationDto, LoginDto } from "../../api_gateway/dto/index";

@Injectable()
export class AuthService {
  constructor(
    private userPrisma: UserPrismaService,
    private jwt: JwtService,
  ) {}

  async signup(dto: RegistrationDto) {
    const hash: string = await this.hashData(dto.password);
    try {
      const user = await this.userPrisma.user.create({
        data: {
          username: dto.username,
          email: dto.email,
          hash: hash,
          profile: {
            create: {
              photo_url: "",
              bio: "",
              followerCount: 0,
              followsCount: 0,
            },
          },
        },
      });

      return {
        message: "User Registered successfully",
        userId: user.id,
      };
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
          throw new ForbiddenException("Username or email already exist");
        }
      }
    }
  }

  async login(dto: LoginDto) {
    const user = await this.userPrisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

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
      await this.userPrisma.user.update({
        where: {
          username: user.username,
          hashedRefreshToken: {
            not: null,
          },
        },
        data: {
          hashedRefreshToken: null,
        },
      });

      return {
        message: "Successfully logged out",
      };
    } catch (error) {
      if (error.code == "P2025")
        throw new BadRequestException("User already Logged out");
    }
  }

  private async getTokens(payload: TokenPayload): Promise<Tokens> {
    const jwt_token_options: JwtSignOptions  = {
      secret: process.env.JWT_SECRET,
      expiresIn: 60 * 15,
    };
    const jwt_refresh_token_options: JwtSignOptions  = {
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
      console.error(error)
    }
  }

  async storeRefreshToken(id: string, refreshToken: string): Promise<void> {
    try {
      const hashedRefreshToken = await this.hashData(refreshToken);
      await this.userPrisma.user.update({
        where: {
          id,
        },
        data: {
          hashedRefreshToken,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async refreshToken(dto: any) {
    try {
      const user = await this.userPrisma.user.findUnique({
        where: {
          id: dto.uuid,
        },
      });

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

  private hashData(data: string): Promise<string> {
    return Bun.password.hash(data, {
      algorithm: "argon2d",
      memoryCost: 4,
      timeCost: 3,
    });
  }

  private verifyHash(password: string, passwordHash: string): Promise<boolean> {
    return Bun.password.verify(password, passwordHash, "argon2d");
  }
}
