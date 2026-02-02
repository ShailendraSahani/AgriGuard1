import { Server } from 'socket.io';

let io = null;

export const setSocketServer = (server) => {
  io = server;
};

export const getSocketServer = () => {
  return io;
};
