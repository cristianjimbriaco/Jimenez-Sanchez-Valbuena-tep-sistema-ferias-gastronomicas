import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

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

  // Habilitar ClassSerializerInterceptor para excluir campos con @Exclude()
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  // Habilitar validación global (para que funcionen los DTOs con class-validator)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );


  await app.startAllMicroservices();
  //await app.listen(3000);

  console.log('HTTP en http://localhost:3000');
  console.log('RPC en puerto 3001');
}
bootstrap();
