import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validaciones DTO globales
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // elimina campos extra
      forbidNonWhitelisted: true, // si mandan campos extra -> 400
      transform: true, // transforma types (ej: "1" -> 1) cuando aplica
    }),
  );

  const config = app.get(ConfigService);
  const port = Number(config.get('PORT')) || 3002; // 3002 por ejemplo para ms-products
  await app.listen(port);
  console.log(`[ms-products] running on port ${port}`);
}
bootstrap().catch((err) => {
  console.error('[ms-products] Bootstrap failed', err);
  process.exit(1);
});
