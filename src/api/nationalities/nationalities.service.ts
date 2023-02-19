import { Injectable } from '@nestjs/common';
import { Language } from '@prisma/client';
import { ResponseSuccess } from '@types';
import * as listNation from '@data/nationality.json';

@Injectable()
export class NationalitiesService {
  async findNationalities(language?: Language) {
    return ResponseSuccess(listNation, 'SUCCESS', { language });
  }
}
