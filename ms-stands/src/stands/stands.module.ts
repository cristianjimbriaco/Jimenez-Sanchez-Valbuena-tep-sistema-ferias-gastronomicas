import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stand } from './stand.entity';
import { StandsController } from './stands.controller';
import { StandsService } from './stands.service';

@Module({
  imports: [TypeOrmModule.forFeature([Stand])],
  controllers: [StandsController],
  providers: [StandsService],
  exports: [StandsService],
})
export class StandsModule {}
