import { Module } from '@nestjs/common';
import { MicroservicesModule } from '../microservices/microservices.module';
import { ProductsController } from './products.controller';

@Module({
  imports: [MicroservicesModule],
  controllers: [ProductsController],
})
export class ProductsModule {}
