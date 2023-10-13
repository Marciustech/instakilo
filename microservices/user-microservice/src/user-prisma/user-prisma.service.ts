import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
dotenv.config({ path: "../../../../.env" });

@Injectable({})
export class UserPrismaService extends PrismaClient {
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.USER_DATABASE_URL,
        },
      },
    });
  }
}
