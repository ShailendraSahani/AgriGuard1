import { Server as NetServer } from 'http';
import { NextApiResponse } from 'next';
import { Server as ServerIO } from 'socket.io';

export type NextApiResponseServerIo = NextApiResponse & {
  socket: any & {
    server: NetServer & {
      io: ServerIO;
    };
  };
};

export const emitSocketEvent = (res: NextApiResponseServerIo, event: string, data: any) => {
  if (res.socket.server.io) {
    res.socket.server.io.emit(event, data);
  }
};
