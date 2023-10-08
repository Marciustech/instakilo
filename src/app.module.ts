import { Module } from "@nestjs/common";
import { ApiGatewayModule } from "./api_gateway/api_gateway.module";
import { ClientsModule, Transport } from "@nestjs/microservices";

@Module({
  imports: [
    ApiGatewayModule,
  ],
})
export class AppModule {}
