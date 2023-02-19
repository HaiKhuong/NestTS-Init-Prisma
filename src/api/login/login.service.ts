import { ResponseSuccess } from '@/types';
import { PASSWORD_REGEX, t } from '@/utils';
import { AuthService } from '@auth/auth.service';
import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Language, Status } from '@prisma/client';
import { BcryptService, PrismaService } from '@services';
import * as moment from 'moment';
import * as randomize from 'randomatic';
import { ForgotPasswordDto, LoginUserDto, RegisterUserDto, ResetPasswordDto } from './dto';
@Injectable()
export class LoginUserService {
  constructor(
    private authService: AuthService,
    private prismaService: PrismaService,
    private bcryptService: BcryptService,
    private mailerService: MailerService,
  ) {}

  async refresh(user: any, token: string, language?: Language) {
    try {
      const data = await this.authService.refresh(user, token);
      return ResponseSuccess(data, 'success', { language });
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async login(dto: LoginUserDto, language?: Language) {
    try {
      const userEmailExist = await this.prismaService.user.findFirst({
        where: {
          username: dto.username,
          isDeleted: false,
          profile: { isDeleted: false },
          status: Status.ACTIVE,
        },
      });
      if (!userEmailExist) throw new BadRequestException(t('USERNAME_OR_PASSWORD_INCORRECT', language));

      const isPasswordMatch = await this.bcryptService.compare(dto.password, userEmailExist.password);
      if (!isPasswordMatch) throw new BadRequestException(t('USERNAME_OR_PASSWORD_INCORRECT', language));

      const data = await this.authService.login(userEmailExist);
      return ResponseSuccess(data, 'success', { language });
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async logout(user: any, language?: Language) {
    try {
      const data = await this.authService.logout(user);
      return ResponseSuccess(data, 'success', { language });
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async register(dto: RegisterUserDto, language?: Language) {
    try {
      const { username, ...profileDto } = dto;

      // Generate password
      // const randomPassword = randomize('Aa0', 8);
      const hash = await this.bcryptService.hash(profileDto.password);
      delete profileDto.password;

      // Check for user exists
      const userExist = await this.prismaService.user.findFirst({
        where: {
          username,
          isDeleted: false,
        },
      });
      if (userExist) throw new BadRequestException(t('USERNAME_EXIST', language));

      // Check for user phone exists
      const userPhoneExist = await this.prismaService.staff.findFirst({
        where: {
          phone: profileDto.phone,
          isDeleted: false,
        },
      });
      if (userPhoneExist) throw new BadRequestException(t('PHONE_EXIST', language));

      let profileCode = `NV${('000' + (await this.prismaService.profile.count()) + 1).slice(-4)}`;
      const profileExist = await this.prismaService.profile.findFirst({ where: { code: profileCode } });
      while (profileExist) profileCode = `NV${('000' + (await this.prismaService.profile.count()) + 1).slice(-4)}`;

      const data = await this.prismaService.$transaction(async (prisma) => {
        // Create user
        const user = await prisma.user.create({
          data: {
            username,
            password: hash,
          },
        });

        const staff = await prisma.profile.create({
          data: {
            code: profileCode,
            ...profileDto,
            user: { connect: { id: user.id } },
          },
        });

        return staff;
      });
      const { ...result } = data;
      return ResponseSuccess(result, 'success', { language });
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async forgotPassword(dto: ForgotPasswordDto, language?: Language) {
    try {
      const randomToken = randomize('Aa0', 32);
      const expiredAt = moment().add(30, 'minutes').toDate();

      // Check for exists
      const user = await this.prismaService.user.findFirst({
        where: {
          username: dto.username,
          isDeleted: false,
          profile: { isDeleted: false },
        },
        select: {
          profile: {
            select: {
              email: true,
              fullName: true,
            },
          },
        },
      });
      if (!user) throw new BadRequestException(t('USERNAME_NOT_FOUND', language));

      if (user?.profile?.email) {
        await this.prismaService.reset_Password_Token.upsert({
          where: { username: dto.username },
          create: {
            username: dto.username,
            email: user?.profile?.email,
            token: randomToken,
            expiredAt,
          },
          update: {
            token: randomToken,
            expiredAt,
            isUsed: false,
          },
        });

        await this.mailerService
          .sendMail({
            to: user.profile.email,
            subject: t('RESET_YOUR_PASSWORD', language),
            template: language?.toUpperCase() === Language.VI ? 'forgot-password-vi' : 'forgot-password-en',
            context: {
              name: user.profile?.fullName,
              url: dto?.returnUrl + randomToken,
            },
          })
          .catch(console.error);
      }
      return ResponseSuccess({}, 'success', { language });
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async resetPassword(dto: ResetPasswordDto, language?: Language) {
    try {
      if (!dto.newPassword.match(PASSWORD_REGEX)) throw new BadRequestException(t('PASSWORD_NOT_INVALID', language));

      if (dto.newPassword !== dto.confirmNewPassword)
        throw new BadRequestException(t('NEW_PASSWORD_NOT_MATCH', language));

      const now = moment().toDate();
      const token = await this.prismaService.reset_Password_Token.findFirst({
        where: {
          token: dto.token,
          expiredAt: { gt: now },
          isUsed: false,
        },
      });
      if (!token) throw new BadRequestException(t('INVALID_TOKEN', language));

      await this.prismaService.reset_Password_Token.update({
        where: { id: token.id },
        data: { isUsed: true },
      });

      const hash = await this.bcryptService.hash(dto.newPassword);

      const user = await this.prismaService.user.findFirst({
        where: {
          username: token?.username,
          isDeleted: false,
          profile: { isDeleted: false },
        },
        select: { id: true },
      });

      await this.prismaService.user.update({
        where: { id: user.id },
        data: { password: hash },
      });
      return ResponseSuccess({ username: token?.username || '' }, 'success', { language });
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
}
