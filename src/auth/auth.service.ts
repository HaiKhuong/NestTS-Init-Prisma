import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { BcryptService, PrismaService } from '@services';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private bcryptService: BcryptService,
    private configService: ConfigService,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.prismaService.user.findFirst({
      where: {
        username,
        isDeleted: false,
      },
    });
    if (!user) return null;

    const isPasswordMatch = await this.bcryptService.compare(password, user.password);

    if (isPasswordMatch) {
      const { ...result } = user;
      return result;
    }
    return null;
  }

  async getUser(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });
    if (!user) return null;
    const { ...result } = user;
    return result;
  }

  async updateTokenUser(id: string, token: string) {
    const hashToken = await this.bcryptService.hash(token);
    await this.prismaService.user.update({
      where: { id },
      data: { token: hashToken },
    });
  }

  async login(userOrId: User | string) {
    const id = typeof userOrId === 'string' ? userOrId : userOrId.id;

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(
        {
          id,
        },
        {
          secret: this.configService.get('JWT_ACCESS_SECRET'),
          expiresIn: this.configService.get('JWT_ACCESS_DURATION'),
        },
      ),
      this.jwtService.signAsync(
        {
          id,
        },
        {
          secret: this.configService.get('JWT_REFRESH_SECRET'),
          expiresIn: this.configService.get('JWT_REFRESH_DURATION'),
        },
      ),
    ]);

    await this.updateTokenUser(id, refresh_token);
    return {
      access_token,
      refresh_token,
    };
  }

  async logout(userOrId: User | string) {
    const id = typeof userOrId === 'string' ? userOrId : userOrId.id;
    await this.updateTokenUser(id, null);
  }

  async refresh(userOrId: User | string, token: string) {
    const id = typeof userOrId === 'string' ? userOrId : userOrId.id;
    let oldToken = '';

    const user = await this.prismaService.user.findUnique({ where: { id } });
    if (!user) throw new UnauthorizedException();
    oldToken = user.token;

    const isTokenMatch = await this.bcryptService.compare(token, oldToken);
    if (!isTokenMatch) throw new UnauthorizedException();

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(
        { id },
        {
          secret: this.configService.get('JWT_ACCESS_SECRET'),
          expiresIn: this.configService.get('JWT_ACCESS_DURATION'),
        },
      ),
      this.jwtService.signAsync(
        { id },
        {
          secret: this.configService.get('JWT_REFRESH_SECRET'),
          expiresIn: this.configService.get('JWT_REFRESH_DURATION'),
        },
      ),
    ]);

    await this.updateTokenUser(id, refresh_token);
    return {
      access_token,
      refresh_token,
    };
  }
}
