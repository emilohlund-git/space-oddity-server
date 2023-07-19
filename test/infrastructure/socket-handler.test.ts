/* eslint-disable import/no-extraneous-dependencies */
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server, Socket as ServerSocket } from 'socket.io';
import Client, { Socket as ClientSocket } from 'socket.io-client';
import GameService from '../../src/application/services/game.service';
import { Command } from '../../src/domain/interfaces/command.interface';
import SocketHandler, { CommandFactory } from '../../src/infrastructure/socket.handler';
import { mockGameService } from '../utils/game-service.mock';
dotenv.config();

describe('SocketHandler', () => {
  let io: Server;
  let serverSocket: ServerSocket;
  let clientSocket: ClientSocket;
  let gameService: GameService;

  beforeAll((done) => {
    const { mockedGameService } = mockGameService();
    gameService = mockedGameService;

    const httpServer = createServer();
    io = new Server(httpServer);
    const port = 3006;

    httpServer.listen(port, () => {
      clientSocket = Client(`http://localhost:${port}`);
      io.on('connection', (socket) => {
        serverSocket = socket;
      });
      clientSocket.on('connect', done);
    });
  });

  afterAll(() => {
    io.close();
    serverSocket.disconnect();
    clientSocket.close();
  });

  describe('getCommands', () => {
    test('should retrieve all registered commands in the command factory', () => {
      const socketHandler = new SocketHandler(io, gameService);
      const commands: CommandFactory = socketHandler.commands;

      for (const commandName in commands) {
        if (commands.hasOwnProperty(commandName)) {
          const command = commands[commandName as keyof CommandFactory];
          expect(command).toBeDefined();
        }
      }
    });
  });

  describe('handleConnection', () => {
    test('should register event listeners for each command', (done) => {
      class MockCommand extends Command {
        execute(): void { /* Mock implementation */ }
      }

      const mockPayload = { test: 'payload' };

      const socketHandler = new SocketHandler(io, gameService);

      socketHandler.registerCommand('UserConnect', MockCommand);
      socketHandler.registerCommand('CreateLobby', MockCommand);
      socketHandler.registerCommand('JoinLobby', MockCommand);
      socketHandler.registerCommand('LeaveLobby', MockCommand);
      socketHandler.registerCommand('SendMessage', MockCommand);
      socketHandler.registerCommand('UserReady', MockCommand);
      socketHandler.registerCommand('PickedCard', MockCommand);
      socketHandler.registerCommand('PlayedCard', MockCommand);
      socketHandler.registerCommand('ChangeTurn', MockCommand);
      socketHandler.registerCommand('StartGame', MockCommand);
      socketHandler.registerCommand('CardDiscarded', MockCommand);
      socketHandler.registerCommand('GameOver', MockCommand);
      socketHandler.registerCommand('UserDisconnect', MockCommand);
      socketHandler.registerCommand('MatchCards', MockCommand);
      socketHandler.registerCommand('SaveGameState', MockCommand);
      socketHandler.registerCommand('RetrieveGameState', MockCommand);
      socketHandler.registerCommand('Ping', MockCommand);

      socketHandler.handleConnection();

      clientSocket.emit('UserConnect', mockPayload);

      serverSocket.on('UserConnect', (payload) => {
        expect(payload).toEqual(mockPayload);
        done();
      });
    });

    test('should handle connection and register event listeners', (done) => {
      const mockOn = jest.spyOn(io, 'on');
      const mockSocketOn = jest.spyOn(serverSocket, 'on');

      const socketHandler = new SocketHandler(io, gameService);
      socketHandler.handleConnection();

      expect(mockOn).toHaveBeenCalledWith('connection', expect.any(Function));

      // Simulate a 'connection' event by calling the registered 'connection' event handler manually
      const connectionHandler = mockOn.mock.calls[0][1];
      connectionHandler(serverSocket);

      // Expect the event listeners to be registered based on the commands
      expect(mockSocketOn).toHaveBeenCalledWith('UserConnect', expect.any(Function));
      expect(mockSocketOn).toHaveBeenCalledWith('CreateLobby', expect.any(Function));
      expect(mockSocketOn).toHaveBeenCalledWith('JoinLobby', expect.any(Function));
      expect(mockSocketOn).toHaveBeenCalledWith('LeaveLobby', expect.any(Function));
      expect(mockSocketOn).toHaveBeenCalledWith('SendMessage', expect.any(Function));
      expect(mockSocketOn).toHaveBeenCalledWith('UserReady', expect.any(Function));
      expect(mockSocketOn).toHaveBeenCalledWith('PickedCard', expect.any(Function));
      expect(mockSocketOn).toHaveBeenCalledWith('PlayedCard', expect.any(Function));
      expect(mockSocketOn).toHaveBeenCalledWith('ChangeTurn', expect.any(Function));
      expect(mockSocketOn).toHaveBeenCalledWith('StartGame', expect.any(Function));
      expect(mockSocketOn).toHaveBeenCalledWith('CardDiscarded', expect.any(Function));
      expect(mockSocketOn).toHaveBeenCalledWith('GameOver', expect.any(Function));
      expect(mockSocketOn).toHaveBeenCalledWith('UserDisconnect', expect.any(Function));
      expect(mockSocketOn).toHaveBeenCalledWith('MatchCards', expect.any(Function));
      expect(mockSocketOn).toHaveBeenCalledWith('SaveGameState', expect.any(Function));
      expect(mockSocketOn).toHaveBeenCalledWith('RetrieveGameState', expect.any(Function));
      expect(mockSocketOn).toHaveBeenCalledWith('Ping', expect.any(Function));

      done();
    });

    test('should reject connection if no API key is provided', () => {
      const socketHandler = new SocketHandler(io, gameService);
      const mockUse = jest.spyOn(io, 'use');
      const mockNext = jest.fn();
      const mockSocket = {
        handshake: {
          headers: {},
        },
      } as any;

      socketHandler.handleConnection();

      // Simulate the 'use' middleware by calling the registered 'use' middleware function manually
      const useMiddleware = mockUse.mock.calls[0][0];
      useMiddleware(mockSocket, mockNext);

      expect(mockNext).toHaveBeenCalledWith(new Error('🌎 Connection rejected: No API key'));
    });

    test('should reject connection if invalid API key is provided', () => {
      const socketHandler = new SocketHandler(io, gameService);
      const mockUse = jest.spyOn(io, 'use');
      const mockNext = jest.fn();
      const mockSocket = {
        handshake: {
          headers: {
            'x-api-key': 'invalid-api-key',
          },
        },
      } as any;

      socketHandler.handleConnection();

      // Simulate the 'use' middleware by calling the registered 'use' middleware function manually
      const useMiddleware = mockUse.mock.calls[0][0];
      useMiddleware(mockSocket, mockNext);

      expect(mockNext).toHaveBeenCalledWith(new Error('🌎 Connection rejected: Invalid API key'));
    });

    test('should handle socket error inside executeCommand catch statement', () => {
      const socketHandler = new SocketHandler(io, gameService);
      const mockSocket: any = {
        emit: jest.fn(),
        disconnect: jest.fn(),
      };
      const mockError = new Error('Test error');
      const mockCreateCommand = jest.fn().mockImplementation(() => {
        throw mockError;
      });

      const mockHandleSocketError = jest.spyOn(socketHandler, 'handleSocketError');

      socketHandler.executeCommand(mockSocket, {}, mockCreateCommand);

      expect(mockHandleSocketError).toHaveBeenCalled();
    });

    describe('handleSocketError', () => {
      test('should log the error message and emit an error event', () => {
        const socketHandler = new SocketHandler(io, gameService);
        const mockSocket: any = {
          emit: jest.fn(),
          disconnect: jest.fn(),
        };
        const mockError = new Error('Test error');

        socketHandler.handleSocketError(mockError, mockSocket);

        expect(mockSocket.emit).toHaveBeenCalledWith('error', mockError.message);
      });
    });
  });
});
