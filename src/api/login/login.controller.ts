import { LoginUserService } from '@api/login/login.service';
import { JwtAuthGuard, JwtRefreshAuthGuard } from '@auth/guards';
import { CurrentUser } from '@decorators';
import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { ForgotPasswordDto, LoginUserDto, RegisterUserDto, ResetPasswordDto } from './dto';

@Controller('v1/auth')
@ApiTags('Login User')
export class LoginUserController {
  constructor(private readonly loginUserService: LoginUserService) {}

  @Get('user/refresh')
  @UseGuards(JwtRefreshAuthGuard)
  @ApiBearerAuth('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@CurrentUser() user, @Request() req, @Headers() header) {
    return this.loginUserService.refresh(user, req['refreshToken'], header['language']);
  }

  @Post('user/login')
  @ApiBody({ type: () => LoginUserDto })
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginUserDto, @Headers() header) {
    return this.loginUserService.login(dto, header['language']);
  }

  @Post('user/logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@CurrentUser() user, @Headers() header) {
    return this.loginUserService.logout(user, header['language']);
  }

  @Post('user/register')
  @HttpCode(HttpStatus.CREATED)
  registerAdmin(@Body() dto: RegisterUserDto, @Headers() header) {
    return this.loginUserService.register(dto, header['language']);
  }

  @Post('user/forgot-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  forgotPassword(@Body() dto: ForgotPasswordDto, @Headers() header) {
    return this.loginUserService.forgotPassword(dto, header['language']);
  }

  @Post('user/reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() dto: ResetPasswordDto, @Headers() header) {
    return this.loginUserService.resetPassword(dto, header['language']);
  }
}
