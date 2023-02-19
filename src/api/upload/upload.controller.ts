import { UploadService } from '@api/upload/upload.service';
import { JwtAuthGuard } from '@auth/guards';
import { Controller, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Language } from '@prisma/client';

@Controller('v1/upload')
@ApiTags('Upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file', { limits: { files: 1 } }))
  @ApiConsumes('multipart/form-data')
  upload(@UploadedFile() file: Express.Multer.File, @Query('language') language: Language) {
    return this.uploadService.uploadImage(file, language || Language.VI);
  }

  @Post('file')
  @UseInterceptors(FileInterceptor('file', { limits: { files: 1 } }))
  @ApiConsumes('multipart/form-data')
  uploadFile(@UploadedFile() file: Express.Multer.File, @Query('language') language: Language) {
    return this.uploadService.uploadFile(file, language || Language.VI);
  }
}
