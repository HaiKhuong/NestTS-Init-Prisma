import { Global, Module } from '@nestjs/common';
import { PrismaService, BcryptService } from '@services';

@Global()
@Module({
  imports: [],
  providers: [PrismaService, BcryptService],
  exports: [PrismaService, BcryptService],
})
export class ServicesModule {}
