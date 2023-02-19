import { LoginUserController } from '@api/login/login.controller';
import { LoginUserService } from '@api/login/login.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [LoginUserController],
  providers: [LoginUserService],
})
export class LoginUserModule {}
