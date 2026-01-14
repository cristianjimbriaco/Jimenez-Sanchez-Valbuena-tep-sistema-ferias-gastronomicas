import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { MicroservicesModule } from '../microservices/microservices.module';

@Module({
  imports: [MicroservicesModule],
  controllers: [OrdersController],
})
export class OrdersModule {}
