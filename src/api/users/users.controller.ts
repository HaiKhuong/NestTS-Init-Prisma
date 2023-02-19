import { ChangePasswordDto, FilterUsersDto, UpdatePasswordDto } from '@api/users/dto';
import { UpdateUsersDto } from '@api/users/dto/update-user.dto';
import { UsersService } from '@api/users/users.service';
import { JwtAuthGuard } from '@auth/guards';
import { CurrentUser, Paginate } from '@decorators';
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiNoContentResponse, ApiTags } from '@nestjs/swagger';
import { Pagination } from '@types';
import { CreateUsersDto } from './dto/create-user.dto';
@Controller('v1/user')
@ApiTags('Users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('')
  @HttpCode(HttpStatus.OK)
  findAll(@Query() dto: FilterUsersDto, @Paginate() pagination: Pagination, @Headers() header) {
    return this.usersService.findAll(dto, pagination, header['language']);
  }

  @Get('me')
  getMe(@CurrentUser() user, @Headers() header) {
    return this.usersService.getMe(user['id'], header['language']);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string, @Headers() header) {
    return this.usersService.findOne(id, header['language']);
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  createUser(@CurrentUser() user, @Body() dto: CreateUsersDto, @Headers() header) {
    return this.usersService.createUser(user['id'], dto, header['language']);
  }

  @Patch('password')
  @ApiBearerAuth('refresh')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  changePassword(@CurrentUser() user, @Body() dto: ChangePasswordDto, @Headers() header) {
    return this.usersService.changePassword(user['id'], dto, header['language']);
  }

  @Patch('change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  updatePassword(@CurrentUser() user, @Body() dto: UpdatePasswordDto, @Headers() header) {
    return this.usersService.updatePassword(user['id'], dto, header['language']);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  updateUser(@CurrentUser() user, @Param('id') id: string, @Body() dto: UpdateUsersDto, @Headers() header) {
    return this.usersService.updateUser(user['id'], id, dto, header['language']);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  deleteUser(@CurrentUser() user, @Param('id') id: string, @Headers() header) {
    return this.usersService.deleteUser(user['id'], id, header['language']);
  }
}
