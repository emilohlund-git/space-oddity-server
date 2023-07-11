import { createServer } from 'http';
import { Server, Socket as ServerSocket } from 'socket.io';
import Client, { Socket as ClientSocket } from 'socket.io-client';

export function createSocketServer(clientSockets: ClientSocket[], serverSocket: ServerSocket, done: jest.DoneCallback): Server {
  const httpServer = createServer();
  const io = new Server(httpServer);
  const port = 4006;

  httpServer.listen(port, () => {
    clientSockets.push(Client(`http://localhost:${port}`));

    io.on('connection', (socket) => {
      serverSocket = socket;
    });

    clientSockets[0].on('connect', done);
  });

  return io;
}