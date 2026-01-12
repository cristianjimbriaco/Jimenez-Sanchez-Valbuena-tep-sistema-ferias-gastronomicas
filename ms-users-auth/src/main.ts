import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Microservicio RPC
  app.connectMicroservice({
    transport: Transport.TCP,
    options: {
      host: 'localhost',
      port: 3001,
    },
  });

  await app.startAllMicroservices();
  await app.listen(3000);

  console.log('HTTP en http://localhost:3000');
  console.log('RPC en puerto 3001');
}
bootstrap();
