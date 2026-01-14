import { Module } from '@nestjs/common';
import { MicroservicesModule } from '../microservices/microservices.module';
import { StandsController } from './stands.controller';

@Module({
  imports: [MicroservicesModule],
  controllers: [StandsController],
})
export class StandsModule {}
