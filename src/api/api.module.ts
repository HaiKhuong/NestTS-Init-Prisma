import { CommonsModule } from '@api/commons/commons.module';
import { DownloadsModule } from '@api/downloads/downloads.module';
import { LoginUserModule } from '@api/login/login.module';
import { NationalitiesModule } from '@api/nationalities/nationalities.module';
import { SocketGateWayModule } from '@api/socket-io/socket-io.module';
import { UploadModule } from '@api/upload/upload.module';
import { UsersModule } from '@api/users/users.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    CommonsModule,
    DownloadsModule,
    LoginUserModule,
    NationalitiesModule,
    UploadModule,
    UsersModule,
    SocketGateWayModule,
  ],
  providers: [],
  exports: [],
})
export class ApiModule {}
