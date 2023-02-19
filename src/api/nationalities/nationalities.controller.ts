import { Controller, Get, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NationalitiesService } from './nationalities.service';

@Controller()
@ApiTags('Nationalities')
export class NationalitiesController {
  constructor(private readonly nationalityService: NationalitiesService) {}

  @Get('v1/nationalities')
  @HttpCode(HttpStatus.OK)
  findAddresses(@Headers() header) {
    return this.nationalityService.findNationalities(header['language']);
  }
}
