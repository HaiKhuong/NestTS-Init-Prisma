import { DownloadsService } from '@api/downloads/downloads.service';
import { UploadController } from '@api/upload/upload.controller';
import { UploadService } from '@api/upload/upload.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [UploadController],
  providers: [UploadService, DownloadsService],
  exports: [UploadService],
})
export class UploadModule {}
