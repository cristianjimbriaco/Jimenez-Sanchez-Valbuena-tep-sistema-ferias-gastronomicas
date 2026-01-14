import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5436,
      username: process.env.DB_USER || 'orders_user',
      password: process.env.DB_PASSWORD || 'orders_pass',
      database: process.env.DB_NAME || 'orders_db',
      autoLoadEntities: true,
      synchronize: true, // ✅ DEV: crea tablas automáticamente
    }),
    OrdersModule,
  ],
})
export class AppModule {}
