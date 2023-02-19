import { PASSWORD_REGEX, USERNAME_REGEX } from '@/utils';
import { usersSelect } from '@api/users/conditions';
import { ChangePasswordDto, CreateUsersDto, FilterUsersDto, UpdatePasswordDto, UpdateUsersDto } from '@api/users/dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Language, Prisma, Status } from '@prisma/client';
import { BcryptService, PrismaService } from '@services';
import { Pagination } from '@types';
import { cleanup, t } from '@utils';
import { ResponseSuccess } from '../../types/response';
@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService, private readonly bcryptService: BcryptService) {}

  async checkUserExist(id: string) {
    return await this.prismaService.user.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });
  }

  async checkUsernameExist(username: string) {
    return await this.prismaService.user.findFirst({
      where: {
        username,
        isDeleted: false,
      },
    });
  }

  async getMe(userId: string, language?: Language) {
    try {
      const data = await this.prismaService.user.findFirst({
        where: {
          id: userId,
          isDeleted: false,
        },
        select: usersSelect,
      });
      return ResponseSuccess(data, 'SUCCESS', { language });
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async findAll(dto: FilterUsersDto, pagination: Pagination, language?: Language) {
    try {
      const { skip, take } = pagination;
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

      const [total, data] = await this.prismaService.$transaction([
        this.prismaService.user.count({ where }),
        this.prismaService.user.findMany({
          where,
          select: usersSelect,
          skip,
          take,
          orderBy: {
            createdAt: 'desc',
          },
        }),
      ]);

      return ResponseSuccess(data, 'SUCCESS', {
        language,
        pagination,
        total,
      });
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async findOne(id: string, language?: Language) {
    try {
      const userIdExist = await this.checkUserExist(id);
      if (!userIdExist) throw new BadRequestException(t('USER_NOT_FOUND', language));

      const data = await this.prismaService.user.findFirst({
        where: {
          id,
          isDeleted: false,
        },
        select: usersSelect,
      });
      return ResponseSuccess(data, 'SUCCESS', { language });
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async createUser(userId: string, dto: CreateUsersDto, language?: Language) {
    try {
      const { profileId, ...createUser } = dto;
      const profileExist = await this.prismaService.profile.findFirst({
        where: {
          id: profileId,
          isDeleted: false,
        },
      });
      if (!profileExist) throw new BadRequestException(t('PROFILE_NOT_FOUND', language));

      if (!dto?.username.match(USERNAME_REGEX)) throw new BadRequestException(t('INVALID_USERNAME', language));

      const usernameExist = await this.checkUsernameExist(createUser.username);
      if (usernameExist) throw new BadRequestException(t('USERNAME_EXIST', language));

      const newHashPassword = await this.bcryptService.hash(process.env.DEFAULT_PASSWORD);

      const data = await this.prismaService.$transaction(async (prisma) => {
        const data = await prisma.user.create({
          data: {
            ...createUser,
            password: newHashPassword,
            profile: { connect: { id: profileId } },
            createdBy: userId,
          },
        });

        return await prisma.user.findFirst({
          where: { id: data.id },
          select: usersSelect,
        });
      });
      return ResponseSuccess(data, 'SUCCESS', { language });
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async updateUser(userId: string, id: string, dto: UpdateUsersDto, language?: Language) {
    try {
      const { profileId, ...updateUser } = dto;
      const userIdExist = await this.prismaService.user.findFirst({
        where: {
          id,
          isDeleted: false,
        },
      });
      if (!userIdExist) throw new BadRequestException(t('USER_NOT_FOUND', language));
      if (!dto?.username.match(USERNAME_REGEX)) throw new BadRequestException(t('INVALID_USERNAME', language));
      const usernameExist = await this.checkUsernameExist(dto.username);
      if (usernameExist && usernameExist.id !== id) {
        throw new BadRequestException(t('USERNAME_EXIST', language));
      }
      const data = await this.prismaService.$transaction(async (prisma) => {
        const data = await prisma.user.update({
          where: { id },
          data: {
            ...updateUser,
            profile: { connect: { id: profileId } },
            updatedBy: userId,
          },
        });

        return await prisma.user.findFirst({
          where: { id: data.id },
          select: usersSelect,
        });
      });
      return ResponseSuccess(data, 'SUCCESS', { language });
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async updatePassword(userId: string, dto: UpdatePasswordDto, language?: Language) {
    try {
      if (!dto?.newPassword.match(PASSWORD_REGEX)) throw new BadRequestException(t('PASSWORD_NOT_INVALID', language));

      if (dto.newPassword !== dto.confirmNewPassword)
        throw new BadRequestException(t('NEW_PASSWORD_NOT_MATCH', language));

      const newHashPassword = await this.bcryptService.hash(dto.newPassword);
      await this.prismaService.user.update({
        where: { id: dto.userId },
        data: {
          password: newHashPassword,
          updatedBy: userId,
        },
      });

      return ResponseSuccess({}, 'SUCCESS', { language });
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async changePassword(userId: string, dto: ChangePasswordDto, language?: Language) {
    try {
      if (!dto.newPassword.match(PASSWORD_REGEX)) throw new BadRequestException(t('PASSWORD_NOT_INVALID', language));

      if (dto.newPassword !== dto.confirmNewPassword)
        throw new BadRequestException(t('NEW_PASSWORD_NOT_MATCH', language));

      const userIdExist = await this.prismaService.user.findFirst({
        where: {
          id: userId,
          isDeleted: false,
        },
      });
      if (!userIdExist) throw new BadRequestException(t('USER_NOT_FOUND', language));

      const hashPassword = await this.prismaService.user.findUnique({
        where: { id: userId },
        select: { password: true },
      });
      if (!hashPassword) throw new BadRequestException(t('USER_NOT_FOUND', language));

      const isPasswordMatch = await this.bcryptService.compare(dto.oldPassword, hashPassword.password);
      if (!isPasswordMatch) throw new BadRequestException(t('OLD_PASSWORD_NOT_MATCH', language));

      const newHashPassword = await this.bcryptService.hash(dto.newPassword);
      await this.prismaService.user.update({
        where: { id: userId },
        data: { password: newHashPassword },
      });
      return ResponseSuccess({}, 'SUCCESS', { language });
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async deleteUser(userId: string, id: string, language?: Language) {
    try {
      const userIdExist = await this.checkUserExist(id);
      if (!userIdExist) throw new BadRequestException(t('USER_NOT_FOUND', language));

      const data = await this.prismaService.user.update({
        where: { id },
        data: {
          status: Status.INACTIVE,
          isDeleted: true,
          deletedBy: userId,
        },
      });
      return ResponseSuccess(data, 'SUCCESS', { language });
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
}
