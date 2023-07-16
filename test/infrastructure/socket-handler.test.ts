/* eslint-disable import/no-extraneous-dependencies */
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server, Socket as ServerSocket } from 'socket.io';
import Client, { Socket as ClientSocket } from 'socket.io-client';
import { CardService } from '../../src/application/services/card.service';
import { DeckService } from '../../src/application/services/deck.service';
import GameService from '../../src/application/services/game.service';
import { LobbyService } from '../../src/application/services/lobby.service';
import { TableService } from '../../src/application/services/table.service';
import { UserService } from '../../src/application/services/user.service';
import GameState from '../../src/domain/entities/GameState';
import { Lobby } from '../../src/domain/entities/Lobby';
import Player from '../../src/domain/entities/Player';
import Table from '../../src/domain/entities/Table';
import { Command } from '../../src/domain/interfaces/command.interface';
import { CardRepository } from '../../src/domain/repositories/card-repository.interface';
import { DeckRepository } from '../../src/domain/repositories/deck-repository.interface';
import { LobbyRepository } from '../../src/domain/repositories/lobby-repository.interface';
import { TableRepository } from '../../src/domain/repositories/table-repository.interface';
import { UserRepository } from '../../src/domain/repositories/user-repository.interface';
import { InMemoryCardRepository } from '../../src/infrastructure/repositories/in-memory-card.repository';
import { InMemoryDeckRepository } from '../../src/infrastructure/repositories/in-memory-deck.repository';
import { InMemoryLobbyRepository } from '../../src/infrastructure/repositories/in-memory-lobby.repository';
import { InMemoryTableRepository } from '../../src/infrastructure/repositories/in-memory-table.repository';
import { InMemoryUserRepository } from '../../src/infrastructure/repositories/in-memory-user.repository';
import SocketHandler from '../../src/infrastructure/socket.handler';
dotenv.config();

describe('SocketHandler', () => {
  let io: Server;
  let serverSocket: ServerSocket;
  let clientSocket: ClientSocket;
  let cardRepository: CardRepository;
  let cardService: CardService;
  let userRepository: UserRepository;
  let tableRepository: TableRepository;
  let deckRepository: DeckRepository;
  let userService: UserService;
  let lobbyRepository: LobbyRepository;
  let lobbyService: LobbyService;
  let tableService: TableService;
  let deckService: DeckService;
  let gameService: GameService;
  let gameState: GameState;

  beforeAll((done) => {
    cardRepository = new InMemoryCardRepository();
    userRepository = new InMemoryUserRepository();
    lobbyRepository = new InMemoryLobbyRepository();
    tableRepository = new InMemoryTableRepository();
    deckRepository = new InMemoryDeckRepository();
    cardService = new CardService(cardRepository);
    userService = new UserService(userRepository);
    lobbyService = new LobbyService(lobbyRepository);
    tableService = new TableService(tableRepository);
    deckService = new DeckService(deckRepository);
    gameState = new GameState(new Table());
    gameState.setLobby(new Lobby(new Player('12345', 'testing')));
    gameService = new GameService(
      userService,
      cardService,
      tableService,
      deckService,
      lobbyService,
    );

    gameService.setGameState(gameState);

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

    userRepository.clear();
    lobbyRepository.clear();
  });

  afterAll(() => {
    io.close();
    serverSocket.disconnect();
    clientSocket.close();
  });

  describe('handleConnection', () => {
    test('should register event listeners for each command', (done) => {
      // Define a mock command and payload
      class MockCommand extends Command {
        constructor(private socket: ServerSocket, private payload: any) {
          super(payload);
        }

        execute(): void {
          // Mock implementation
        }
      }

      const mockCommandClass = MockCommand as any;
      const mockPayload = { test: 'payload' };

      // Register the mock command in the commandFactory
      const socketHandler = new SocketHandler(io, gameService);

      socketHandler.setCommands({
        UserConnect: (socket, payload) => new mockCommandClass(socket, payload),
        CreateLobby: (socket, payload) => new mockCommandClass(socket, payload),
        JoinLobby: (socket, payload) => new mockCommandClass(socket, payload),
        LeaveLobby: (socket, payload) => new mockCommandClass(socket, payload),
        SendMessage: (socket, payload) => new mockCommandClass(socket, payload),
        UserReady: (socket, payload) => new mockCommandClass(socket, payload),
        PickedCard: (socket, payload) => new mockCommandClass(socket, payload),
        PlayedCard: (socket, payload) => new mockCommandClass(socket, payload),
        ChangeTurn: (socket, payload) => new mockCommandClass(socket, payload),
        StartGame: (socket, payload) => new mockCommandClass(socket, payload),
        CardDiscarded: (socket, payload) => new mockCommandClass(socket, payload),
        GameOver: (socket, payload) => new mockCommandClass(socket, payload),
        UserDisconnect: (socket, payload) => new mockCommandClass(socket, payload),
        MatchCards: (socket, payload) => new mockCommandClass(socket, payload),
      });

      // Call the handleConnection method to register event listeners
      socketHandler.handleConnection();

      // Simulate the 'TestEvent' being emitted by the clientSocket
      clientSocket.emit('UserConnect', mockPayload);

      // Verify that the command was executed
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

    describe('setCommands', () => {
      test('should set the commands', () => {
        const socketHandler = new SocketHandler(io, gameService);
        const commands = {
          UserConnect: jest.fn(),
          CreateLobby: jest.fn(),
          JoinLobby: jest.fn(),
        } as any;

        socketHandler.setCommands(commands);

        expect(socketHandler.getCommands()).toEqual(commands);
      });
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
        expect(mockSocket.disconnect).toHaveBeenCalledWith(true);
      });
    });
  });
});
