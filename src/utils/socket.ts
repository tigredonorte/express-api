import * as http from 'http';
import { Server } from 'socket.io';

import { allowedMethods } from './middlewares/secureApp';
import { Token } from './token';

export class SocketClass {

  private static io: Server;
  constructor(private server: http.Server) {
    SocketClass.io = new Server(this.server, {
      cors: {
        origin: 'http://localhost:3000',
        methods: allowedMethods,
        allowedHeaders: ['Authorization'],
      },
    });
  }

  init() {
    SocketClass.io.on('connection', (socket) => {
      const user =  Token.getToken(socket.handshake.headers.authorization as string);
      if (!user) {
        console.error('user not authenticated!');
        return socket.disconnect();
      }
      socket.on('disconnect', () => {

      });
    });
    
    SocketClass.io.on('disconnect', function () {
      console.log('disconnected');
    });
  }

  static emit(message: string, action: string, data: any) {
    console.log('emitting', { message, action, data });
    SocketClass.io.emit(message, { action, data });
  }
}
