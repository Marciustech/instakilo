// redis.service.ts
import { Injectable } from "@nestjs/common";
import { Redis } from "ioredis";

@Injectable()
export class OnlineUsersService {
  private readonly db: Redis;

  constructor() {
    this.db = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
    });
  }

  async setUserOnline(userId: string, socketId: string): Promise<void> {
    const response = await this.db.set(userId, socketId);
  }

  async setUserOffline(userId: string): Promise<void> {
    const response = await this.db.set(userId, "offline");
  }

  async isUserOnline(userId: string): Promise<boolean> {
    const result = await this.db.get(userId);
    return result !== "offline";
  }

  async getUserSocketId(userId: string): Promise<string> {
    const result = await this.db.get(userId);
    return result;
  }

  async logAllStatus() {
    console.log("Online/offline: ");
    const keys = await this.db.keys("*");
    keys.forEach(async (key) => {
      const value = await this.db.get(key);
      console.log(
        `User: ${key}, Status: ${value !== "offline" ? "online" : value}`,
      );
    });
  }
}
