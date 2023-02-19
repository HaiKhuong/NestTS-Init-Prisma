/* eslint-disable object-curly-newline */
import { FilterUsersDto } from '@api/users/dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import {
  Language, Prisma
} from '@prisma/client';
import { PrismaService } from '@services';
import {
  cleanup, createDownloadFileExcel, t
} from '@utils';
import * as _ from 'lodash';
import {
  userDownloadSelect
} from './conditions';
import {
  defaultExcelColDownloadUser
} from './default-columns';

@Injectable()
export class DownloadsService {
  constructor(
    private prismaService: PrismaService,
  ) {}

  async downloadUserList(dto: FilterUsersDto, language: Language) {
    try {
      let where: Prisma.UserWhereInput = {
        isDeleted: false,
        status: dto?.status,
      };

      if (dto.search) {
        where.OR = [
          {
            profile: {
              OR: [
                { fullName: { contains: dto?.search } },
                { code: { contains: dto?.search } },
                { email: { contains: dto?.search } },
                { phone: { contains: dto?.search } },
              ],
            },
          },
          { username: { contains: dto?.search } },
        ];
      }

      where = cleanup(where);

      const data = await this.prismaService.user.findMany({
        where,
        select: userDownloadSelect,
        orderBy: {
          createdAt: 'desc',
        },
      });
      const newData = await Promise.all(
        await data.map(async (i: any) => {
          const status = t(i?.status, language);
          return {
            ...i,
            status,
          };
        }),
      );

      return createDownloadFileExcel(
        _.orderBy(newData, ['createdAt'], ['desc']),
        defaultExcelColDownloadUser,
        'user',
        language,
      );
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
}
