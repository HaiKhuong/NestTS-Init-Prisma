import { ResponseSuccess } from '@/types';
import { getGenders, getStatus } from '@enums';
import { Controller, Get, Headers } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller('v1')
@ApiTags('Commons')
export class CommonsController {
  @Get('commons/genders')
  getGenders(@Headers() header) {
    return ResponseSuccess(getGenders(header['language']), 'success');
  }

  @Get('commons/status')
  getStatus(@Headers() header) {
    return ResponseSuccess(getStatus(header['language']), 'success');
  }
}
