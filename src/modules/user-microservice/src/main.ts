import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule,
    {
        transport: Transport.NATS,
        options: {
          servers: ['nats://localhost:4222'],
          queue: 'user_queue',
          queueOptions: {
            durable: false,
          },
        }
      }
  );
  await app.listen().then(() => console.log("User Microservice is listening"));
}
bootstrap();
