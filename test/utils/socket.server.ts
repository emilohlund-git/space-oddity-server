import { createServer } from 'http';
import { Server } from 'socket.io';
import Client, { Socket as ClientSocket } from 'socket.io-client';
import GameService from '../../src/application/services/game.service';
import SocketHandler from '../../src/infrastructure/socket.handler';

export function createSocketServer(
  clientSocket: ClientSocket,
  socketHandler: SocketHandler,
  gameService: GameService,
  done: jest.DoneCallback): Server {
  const httpServer = createServer();
  const port = 3001;
  const io = new Server(httpServer);

  httpServer.listen(port, () => {
    clientSocket = Client(`http://localhost:${port}`, {
      extraHeaders: { 'x-api-key': process.env.API_KEY! },
    });
    socketHandler = new SocketHandler(io, gameService);
    socketHandler.handleConnection();
    clientSocket.on('connect', done);
  });

  return io;
}