import {
  ForbiddenException,
  InternalServerErrorException,
  Injectable,
  BadRequestException,
} from "@nestjs/common";
import { UserPrismaService } from "../../modules/user/user-prisma/user-prisma.service";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { JwtService } from "@nestjs/jwt";
import { tokens } from "./types";
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
    try {
      const user = await this.userPrisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });

      if (!user) throw new ForbiddenException("User not registered");

      const passwordMatch = await this.verifyHash(user.hash, dto.password);

      if (!passwordMatch) throw new ForbiddenException("Invalid password");

      const { accessToken, refreshToken } = await this.getTokens(
        user.id,
        user.email,
        user.username,
      );

      //save refresh token to db
      await this.updateRefreshToken(user.id, refreshToken);

      return {
        message: "User access successful",
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw new InternalServerErrorException({ error });
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

  async getTokens(
    uuid: string,
    email: string,
    username: string,
  ): Promise<tokens> {
    const [accessToken, refreshToken] = await Promise.all([
      await this.jwt.signAsync(
        {
          uuid,
          email,
          username,
        },
        {
          secret: process.env.JWT_SECRET,
          //TODO: change expiration date to 60*15 for production
          expiresIn: 60 * 15,
        },
      ),
      await this.jwt.signAsync(
        {
          uuid,
          email,
          username,
        },
        {
          secret: process.env.REFRESH_JWT_SECRET,
          //one week expiration
          expiresIn: 60 * 60 * 24 * 7,
        },
      ),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }

  async updateRefreshToken(id: string, refreshToken: string): Promise<void> {
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
        user.hashedRefreshToken,
        dto.refreshToken,
      );

      if (!refresh_token_matches) throw new ForbiddenException("Access denied");

      const { accessToken, refreshToken } = await this.getTokens(
        user.id,
        user.email,
        user.username,
      );

      await this.updateRefreshToken(user.id, refreshToken);

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
  

  private verifyHash(password1: string, password2: string): Promise<boolean> {
    return Bun.password.verify(password1, password2, "argon2d");

  }
}
