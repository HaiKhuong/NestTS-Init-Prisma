import { DownloadsController } from '@api/downloads/downloads.controller';
import { DownloadsService } from '@api/downloads/downloads.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [DownloadsController],
  providers: [DownloadsService],
  exports: [DownloadsService],
})
export class DownloadsModule {}
