import { OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { PrismaService } from '@services';
import { Server } from 'socket.io';

@WebSocketGateway()
export class SocketGateWayService implements OnModuleInit {
  constructor(private prismaService: PrismaService, private jwtService: JwtService) {}

  @WebSocketServer() server: Server;

  onModuleInit() {
    this.server.on('connection', async (socket) => {
      const authToken = socket.handshake.query['Authorization'];
      const user = await this.jwtService.decode(authToken as string);
      if (user?.['id']) {
        const userExist = await this.prismaService.user.findFirst({
          where: {
            id: user['id'],
            isDeleted: false,
          },
        });
        if (userExist) {
          socket.join(userExist.id);
          this.server.to(userExist.id).emit('connection', {
            msg: 'Connect Successfully',
            code: 200,
          });
        } else {
          socket.disconnect();
          this.server.to(socket.id).emit('connection', {
            msg: 'Connect Failed',
            code: 404,
          });
        }
      } else {
        socket.disconnect();
        this.server.to(socket.id).emit('connection', {
          msg: 'Connect Failed',
          code: 404,
        });
      }
    });
  }
}
