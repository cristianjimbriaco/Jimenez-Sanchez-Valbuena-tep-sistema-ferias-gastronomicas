import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  providers: [AuthService],
  imports: [UsersModule, 
    JwtModule.register({
    secret: process.env.JWT_SECRET || 'secret_key_dev',
    signOptions: { expiresIn: '1h' }
  })],
  controllers: [AuthController],
})
export class AuthModule {}
