import { Module } from '@nestjs/common';
import { NationalitiesController } from '@api/nationalities/nationalities.controller';
import { NationalitiesService } from '@api/nationalities/nationalities.service';

@Module({
  imports: [],
  controllers: [NationalitiesController],
  providers: [NationalitiesService],
})
export class NationalitiesModule {}
