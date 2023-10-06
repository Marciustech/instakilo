import { Module } from "@nestjs/common";
import { ApiGatewayModule } from "./api_gateway/api_gateway.module";

@Module({
  imports: [ApiGatewayModule,],
})
export class AppModule {}
