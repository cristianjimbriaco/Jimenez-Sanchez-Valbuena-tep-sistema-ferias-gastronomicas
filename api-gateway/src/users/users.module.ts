import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { MicroservicesModule } from '../microservices/microservices.module';

@Module({
  controllers: [UsersController],
  imports: [MicroservicesModule],
})
export class UsersModule {}
