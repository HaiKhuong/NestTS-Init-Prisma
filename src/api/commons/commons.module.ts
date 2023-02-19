import { Module } from '@nestjs/common';
import { CommonsController } from '@api/commons/commons.controller';

@Module({
  controllers: [CommonsController],
  providers: [],
})
export class CommonsModule {}
