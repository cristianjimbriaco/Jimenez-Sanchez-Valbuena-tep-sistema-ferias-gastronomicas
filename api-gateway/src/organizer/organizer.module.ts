import { Module } from '@nestjs/common';
import { MicroservicesModule } from '../microservices/microservices.module';
import { OrganizerAnalyticsController } from './organizer-analytics.controller';

@Module({
  imports: [MicroservicesModule],
  controllers: [OrganizerAnalyticsController],
})
export class OrganizerModule {}
