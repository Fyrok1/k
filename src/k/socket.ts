import * as io from 'socket.io';
import { httpServer } from './app';
// import open from "open";

export const Socket = new io.Server(httpServer);

if (process.env.SOCKET != '1' && process.env.NODE_ENV == 'production') {
  Socket.close();
} else {
  setTimeout(() => {
    // if (Socket.sockets.sockets.size == 0) {
    //   open("http://127.0.0.1:"+process.env.PORT);
    // }else{
    //   Socket.emit('refresh-page')
    // }
    Socket.emit('refresh-page');
  }, 1500);
}
