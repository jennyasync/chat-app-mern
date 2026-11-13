import { Server } from 'socket.io';

export const createSocketServer = (httpServer, env) =>
  new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
      methods: ['GET', 'POST'],
    },
    pingInterval: 25_000,
    pingTimeout: 60_000,
    // 1 MB cap per payload; images go over REST, only their URLs come through here.
    maxHttpBufferSize: 1e6,
  });
