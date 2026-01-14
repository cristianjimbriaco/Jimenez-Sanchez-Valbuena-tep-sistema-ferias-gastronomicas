import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

// (Luego lo creamos con Nest CLI)
import { ProductsModule } from './products/products.module';

@Module({
  imports: [
    // Carga variables de entorno desde ms-products/.env
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Conexión a la BD de products (postgres-products: puerto 5435)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: Number(config.get<string>('DB_PORT', '5435')),
        username: config.get<string>('DB_USER', 'products_user'),
        password: config.get<string>('DB_PASSWORD', 'products_pass'), // 👈 string
        database: config.get<string>('DB_NAME', 'products_db'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),


    ProductsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
