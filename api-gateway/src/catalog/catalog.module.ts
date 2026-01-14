import { Module } from '@nestjs/common';
import { MicroservicesModule } from '../microservices/microservices.module';
import { CatalogController } from './catalog.controller';

@Module({
  imports: [MicroservicesModule],
  controllers: [CatalogController],
})
export class CatalogModule {}
