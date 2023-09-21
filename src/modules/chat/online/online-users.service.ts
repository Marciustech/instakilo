// redis.service.ts
import { Injectable } from "@nestjs/common";
import { Redis } from "ioredis";

@Injectable()
export class OnlineUsersService {
  private readonly db: Redis;

  constructor() {
    this.db = new Redis({
      host: "localhost",
      port: 6379,
    });
  }

  async setUserOnline(userId: string, socketId: string): Promise<void> {
    await this.db.set(userId, socketId);
  }

  async setUserOffline(userId: string): Promise<void> {
    await this.db.set(userId, "offline");
  }

  async isUserOnline(userId: string): Promise<boolean> {
    const result = await this.db.get(userId);
    return result !== "offline";
  }

  async getUserSocketId(userId: string): Promise<string> {
    const result = await this.db.get(userId);
    return result;
  }

  async getAll() {
    return await this.db.keys("*");
  }
}
