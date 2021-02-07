import { Server } from 'http';
import * as io from 'socket.io'
import { httpServer } from './app';

export const Socket = new io.Server(httpServer)

if (process.env.SOCKET != "1" && process.env.NODE_ENV == "production") {
  Socket.close();
}