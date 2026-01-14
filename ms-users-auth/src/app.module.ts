import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5433,
      username: process.env.DB_USER || 'users_user',
      password: process.env.DB_PASSWORD || 'users_pass',
      database: process.env.DB_NAME || 'users_db',
      autoLoadEntities: true,
      synchronize: true, // solo dev
    }),
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
