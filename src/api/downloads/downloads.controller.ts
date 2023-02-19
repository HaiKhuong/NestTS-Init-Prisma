import { DownloadsService } from '@api/downloads/downloads.service';
import { FilterUsersDto } from '@api/users/dto';
import { JwtAuthGuard } from '@auth/guards';
import { Controller, Get, HttpCode, HttpStatus, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Language } from '@prisma/client';
import { Response } from 'express';
import { Readable } from 'stream';

@Controller('v1/download')
@ApiTags('Download')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DownloadsController {
  constructor(private readonly downloadsService: DownloadsService) {}


  @Get('users')
  @HttpCode(HttpStatus.OK)
  async downloadUserList(@Query() dto: FilterUsersDto, @Res() res: Response, @Query('language') language: Language) {
    const file = await this.downloadsService.downloadUserList(dto, language || Language.VI);
    const stream = new Readable();
    stream.push(file);
    stream.push(null);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Length': file.length,
    });
    stream.pipe(res);
  }

}
