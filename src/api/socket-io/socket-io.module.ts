import { SocketGateWayService } from '@api/socket-io/socket-io.service';
import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [SocketGateWayService, JwtService],
  exports: [SocketGateWayService],
})
export class SocketGateWayModule {}
