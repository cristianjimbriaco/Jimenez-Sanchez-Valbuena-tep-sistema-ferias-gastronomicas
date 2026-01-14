import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.connectMicroservice({
    transport: Transport.TCP,
    options: {
      host: process.env.PRODUCTS_HOST || 'localhost',
      port: Number(process.env.PRODUCTS_PORT) || 3002,
    },
  });

  await app.startAllMicroservices();
  await app.listen(3003);

  console.log('[ms-products] HTTP running on port 3003');
  console.log('[ms-products] TCP running on port 3002');
}

void bootstrap();
