import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stand } from './stand.entity';
import { StandsService } from './stands.service';
import { StandsController } from './stands.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Stand])],
  providers: [StandsService],
  controllers: [StandsController],
})
export class StandsModule {}
