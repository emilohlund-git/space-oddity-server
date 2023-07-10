/* eslint-disable import/no-extraneous-dependencies */
import { UUID, randomUUID } from 'crypto';
import { createServer } from 'http';
import { Server, Socket as ServerSocket } from 'socket.io';
import Client, { Socket as ClientSocket } from 'socket.io-client';
import CreateLobbyCommand from '../../src/application/commands/create-lobby.command';
import JoinLobbyCommand from '../../src/application/commands/join-lobby.command';
import LeaveLobbyCommand from '../../src/application/commands/leave-lobby.command';
import PickedCardCommand from '../../src/application/commands/picked-card.command';
import PlayedCardCommand from '../../src/application/commands/played-card.command';
import SendMessageCommand from '../../src/application/commands/send-message.command';
import UserConnectCommand from '../../src/application/commands/user-connect.command';
import UserReadyCommand from '../../src/application/commands/user-ready.command';
import CardNotFoundException from '../../src/application/exceptions/card-not-found.exception';
import CardNotInHandException from '../../src/application/exceptions/card-not-in-hand.exception';
import FailedUserConnectionException from '../../src/application/exceptions/failed-user-connection.exception';
import InvalidPayloadException from '../../src/application/exceptions/invalid-payload.exception';
import LobbyExistsException from '../../src/application/exceptions/lobby-exists.exception';
import LobbyNotFoundException from '../../src/application/exceptions/lobby-not-found.exception';
import TableNotFoundException from '../../src/application/exceptions/table-not-found.exception';
import UserNotFoundException from '../../src/application/exceptions/user-not-found.exception';
import { CardService } from '../../src/application/services/card.service';
import { DeckService } from '../../src/application/services/deck.service';
import GameService from '../../src/application/services/game.service';
import { LobbyService } from '../../src/application/services/lobby.service';
import { TableService } from '../../src/application/services/table.service';
import { UserService } from '../../src/application/services/user.service';
import Card from '../../src/domain/entities/Card';
import Deck from '../../src/domain/entities/Deck';
import GameState, { Lights } from '../../src/domain/entities/GameState';
import Hand from '../../src/domain/entities/Hand';
import { Lobby } from '../../src/domain/entities/Lobby';
import Player from '../../src/domain/entities/Player';
import Table from '../../src/domain/entities/Table';
import TwistedCard, { SpecialEffect } from '../../src/domain/entities/TwistedCard';
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
    gameState = new GameState(
      new Lobby(randomUUID(), new Deck()),
      new Table(),
    );
    gameService = new GameService(
      userService,
      cardService,
      tableService,
      deckService,
      lobbyService,
      gameState,
    );

    const httpServer = createServer();
    io = new Server(httpServer);
    httpServer.listen(() => {
      /* @ts-ignore */
      const port = httpServer.address().port;
      /* @ts-ignore */
      clientSocket = new Client(`http://localhost:${port}`);
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
    clientSocket.close();
  });

  describe('CreateLobbyCommand', () => {
    test('should emit LobbyCreated event when valid payload is provided', (done) => {
      const testUser = new Player(clientSocket.id, 'test');
      userService.save(testUser);

      const createLobbyCommand = new CreateLobbyCommand(gameService, serverSocket);

      clientSocket.on('LobbyCreated', (lobby) => {
        expect(lobby).toBeDefined();

        done();
      });

      createLobbyCommand.execute();
    });

    test('should throw UserNotFoundException when user is not found', () => {
      const mockSocket: any = {
        id: 'mock-socket-id',
      };

      expect(() => {
        const createLobbyCommand = new CreateLobbyCommand(gameService, mockSocket, {
          lobbyId: randomUUID(),
          deck: new Deck(),
        });

        createLobbyCommand.execute();
      }).toThrow(UserNotFoundException);
    });

    test('should throw InvalidPayloadException when passing non UUID lobby id', (done) => {
      expect(() => {
        const createLobbyCommand = new CreateLobbyCommand(gameService, serverSocket, {
          lobbyId: 'non-uuid-id' as UUID,
          deck: new Deck(),
        });

        createLobbyCommand.execute();
      }).toThrow(InvalidPayloadException);
      done();
    });

    test('should throw LobbyExistsException when trying to create an existing lobby', (done) => {
      const lobbies = lobbyService.findAll();

      expect(() => {
        const createLobbyCommand = new CreateLobbyCommand(gameService, serverSocket, {
          lobbyId: lobbies[0].id,
          deck: new Deck(),
        });

        createLobbyCommand.execute();
      }).toThrow(LobbyExistsException);
      done();
    });
  });

  describe('JoinLobbyCommand', () => {
    test('should emit UserJoinedLobby event when valid payload is provided', (done) => {
      const testLobby = new Lobby(randomUUID(), new Deck());
      lobbyService.save(testLobby);

      const testUser = new Player(clientSocket.id, 'test', new Hand());
      userService.save(testUser);

      expect(testLobby.getPlayers().length).toBe(0);

      const joinLobbyCommand = new JoinLobbyCommand(gameService, serverSocket, {
        lobbyId: testLobby.id,
      });

      clientSocket.on('UserJoinedLobby', (lobbyId, userId) => {
        expect(lobbyId).toBeDefined();
        expect(userId).toBeDefined();
        const lobby = lobbyService.findById(lobbyId);
        expect(lobby?.getPlayers().length).toBe(1);

        done();
      });

      joinLobbyCommand.execute();
    });

    test('should throw UserNotFoundException when user is not found', () => {
      const mockSocket: any = {
        id: 'mock-socket-id',
      };

      expect(() => {
        const joinLobbyCommand = new JoinLobbyCommand(gameService, mockSocket, {
          lobbyId: randomUUID(),
        });

        joinLobbyCommand.execute();
      }).toThrow(UserNotFoundException);
    });

    test('should throw LobbyNotFoundException when joining non-existing lobby', (done) => {
      expect(() => {
        const joinLobbyCommand = new JoinLobbyCommand(gameService, serverSocket, {
          lobbyId: randomUUID(),
        });

        joinLobbyCommand.execute();
      }).toThrow(LobbyNotFoundException);
      done();
    });

    test('should throw InvalidPayloadException when passing non UUID lobby id', (done) => {
      expect(() => {
        const joinLobbyCommand = new JoinLobbyCommand(gameService, serverSocket, {
          lobbyId: 'non-uuid-id' as UUID,
        });

        joinLobbyCommand.execute();
      }).toThrow(InvalidPayloadException);
      done();
    });
  });

  describe('PickedCardCommand', () => {
    test('should throw UserNotFoundException exception', (done) => {
      const testCard = new Card('');
      cardService.save(testCard);

      const previousId = randomUUID();
      const newId = randomUUID();

      const previousOwner = new Player(previousId, 'test-1');
      const newOwner = new Player(newId, 'test-2');

      userService.save(previousOwner);
      userService.save(newOwner);

      expect(() => {
        const pickedCardCommand = new PickedCardCommand(gameService, serverSocket, {
          cardId: testCard.id,
          userPreviousId: previousId,
          userNewId: 'abcd1234',
        });

        pickedCardCommand.execute();
      }).toThrow(UserNotFoundException);

      expect(() => {
        const pickedCardCommand = new PickedCardCommand(gameService, serverSocket, {
          cardId: testCard.id,
          userPreviousId: 'abcd1234',
          userNewId: newId,
        });

        pickedCardCommand.execute();
      }).toThrow(UserNotFoundException);

      done();
    });

    test('should emit PickedCard event when valid payload is provided', (done) => {
      const testCard = new Card('');
      cardService.save(testCard);

      const previousId = randomUUID();
      const newId = randomUUID();

      const previousOwner = new Player(previousId, 'test-1');
      const newOwner = new Player(newId, 'test-2');

      testCard.setOwner(previousOwner);
      previousOwner.addToHand(testCard);

      userService.save(previousOwner);
      userService.save(newOwner);

      const pickedCardCommand = new PickedCardCommand(gameService, serverSocket, {
        cardId: testCard.id,
        userPreviousId: previousOwner.id,
        userNewId: newOwner.id,
      });

      expect(testCard.getOwner()).toEqual(previousOwner);

      clientSocket.on('PickedCard', (newOwnerId, cardId) => {
        expect(newOwnerId).toBeDefined();
        expect(cardId).toBeDefined();
        expect(newOwnerId).toEqual(newOwner.id);
        expect(cardId).toEqual(testCard.id);
        expect(testCard.getOwner()).toEqual(newOwner);

        done();
      });

      pickedCardCommand.execute();
    });

    test('should throw CardNotInHandException when providing non-existing cardId', (done) => {
      expect(() => {
        const testCard = new Card('');
        cardService.save(testCard);

        const previousOwnerId = randomUUID();
        const newOwnerId = randomUUID();

        const previousOwner = new Player(previousOwnerId, 'test-1');
        const newOwner = new Player(newOwnerId, 'test-2');

        userService.save(previousOwner);
        userService.save(newOwner);

        const pickedCardCommand = new PickedCardCommand(gameService, serverSocket, {
          cardId: testCard.id,
          userPreviousId: previousOwnerId,
          userNewId: newOwnerId,
        });

        pickedCardCommand.execute();
      }).toThrow(CardNotInHandException);
      done();
    });

    test('should throw CardNotFoundException when providing non-existing cardId', (done) => {
      expect(() => {
        const previousOwnerId = randomUUID();
        const newOwnerId = randomUUID();

        const previousOwner = new Player(previousOwnerId, 'test-1');
        const newOwner = new Player(newOwnerId, 'test-2');

        userService.save(previousOwner);
        userService.save(newOwner);

        const pickedCardCommand = new PickedCardCommand(gameService, serverSocket, {
          cardId: randomUUID(),
          userPreviousId: previousOwnerId,
          userNewId: newOwnerId,
        });

        pickedCardCommand.execute();
      }).toThrow(CardNotFoundException);
      done();
    });
  });

  describe('LeaveLobbyCommand', () => {
    test('should emit UserLeftLobby event when valid payload is provided', (done) => {
      const lobbies = lobbyService.findAll();

      expect(lobbies[0].getPlayers().length).toBe(1);

      const leaveLobbyCommand = new LeaveLobbyCommand(gameService, serverSocket, {
        lobbyId: lobbies[0].id,
      });

      clientSocket.on('UserLeftLobby', (lobbyId, userId) => {
        expect(lobbyId).toBeDefined();
        expect(userId).toBeDefined();

        const lobby = lobbyService.findById(lobbyId);
        expect(lobby?.getPlayers().length).toBe(0);

        done();
      });

      leaveLobbyCommand.execute();
    });

    test('should throw InvalidPayloadException when passing non UUID lobby id', (done) => {
      expect(() => {
        const leaveLobbyCommand = new LeaveLobbyCommand(gameService, serverSocket, {
          lobbyId: 'non-uuid-id' as UUID,
        });

        leaveLobbyCommand.execute();
      }).toThrow(InvalidPayloadException);
      done();
    });

    test('should throw UserNotFoundException when user is not found', () => {
      const mockSocket: any = {
        id: 'mock-socket-id',
      };

      expect(() => {
        const leaveLobbyCommand = new LeaveLobbyCommand(gameService, mockSocket, {
          lobbyId: randomUUID(),
        });

        leaveLobbyCommand.execute();
      }).toThrow(UserNotFoundException);
    });

    test('should throw LobbyNotFoundException when attempting to leave non-existing lobby', (done) => {
      expect(() => {
        const leaveLobbyCommand = new LeaveLobbyCommand(gameService, serverSocket, {
          lobbyId: randomUUID(),
        });

        leaveLobbyCommand.execute();
      }).toThrow(LobbyNotFoundException);
      done();
    });
  });

  describe('UserConnectCommand', () => {
    test('should throw FailedUserConnectionException when user creation fails', () => {
      jest.spyOn(gameService.getUserService(), 'findById').mockImplementation((userId) => {
        if (userId === serverSocket.id) {
          return undefined;
        }
        return {} as Player;
      });

      const userConnectCommand = new UserConnectCommand(gameService, serverSocket, {
        username: 'test1234',
      });

      expect(() => userConnectCommand.execute()).toThrow(FailedUserConnectionException);

      jest.spyOn(gameService.getUserService(), 'findById').mockRestore();
    });

    test('should emit UserConnected event when valid payload is provided', (done) => {
      userRepository.clear();

      const userConnectCommand = new UserConnectCommand(gameService, serverSocket, {
        username: 'test',
      });

      clientSocket.on('UserConnected', (lobby) => {
        expect(lobby).toBeDefined();

        done();
      });

      userConnectCommand.execute();
    });

    test('should throw FailedUserConnectionException when trying to connect with existing username', (done) => {
      expect(() => {
        const userConnectCommand = new UserConnectCommand(gameService, serverSocket, {
          username: 'test',
        });

        userConnectCommand.execute();
      }).toThrow(FailedUserConnectionException);
      done();
    });

    test('should throw InvalidPayloadException when passing an empty username string', (done) => {
      expect(() => {
        const userConnectCommand = new UserConnectCommand(gameService, serverSocket, {
          username: '',
        });

        userConnectCommand.execute();
      }).toThrow(InvalidPayloadException);
      done();
    });
  });

  describe('SendMessageCommand', () => {
    test('should emit MessageSent event when valid payload is provided', (done) => {
      const users = userService.findAll();
      const lobbies = lobbyService.findAll();

      const sendMessageCommand = new SendMessageCommand(serverSocket, {
        userId: users[0].id,
        lobbyId: lobbies[0].id,
        message: 'test',
      });

      clientSocket.on('MessageSent', (_userId, _lobbyId, message) => {
        expect(message).toBeDefined();
        expect(message).toBe('test');
        done();
      });

      sendMessageCommand.execute();
    });

    test('should throw InvalidPayloadException when passing non UUID lobby id', (done) => {
      expect(() => {
        const sendMessageCommand = new SendMessageCommand(serverSocket, {
          lobbyId: 'non-uuid-id' as UUID,
          message: '1234',
          userId: 'non-uuid-id',
        });

        sendMessageCommand.execute();
      }).toThrow(InvalidPayloadException);
      done();
    });
  });

  describe('registerCommand', () => {
    test('should register a command in the commandFactory', () => {
      // Create a mock command class and commandArgs
      class MockCommand implements Command {
        constructor(private commandArgs: GameService, private socket: ServerSocket, private payload: any) { }

        execute(): void {
          // Mock implementation
        }
      }

      const mockCommandClass = MockCommand as any;
      const mockCommandArgs = gameService;

      // Register the command using the registerCommand method
      const socketHandler = new SocketHandler(io, gameService);

      socketHandler.registerCommand('CreateLobby', mockCommandClass, mockCommandArgs);

      // Verify that the command is registered in the commandFactory
      const commandFactory = socketHandler.getCommands();
      expect(commandFactory.CreateLobby).toBeDefined();
    });
  });

  describe('PlayedCardCommand', () => {
    test('should switch the GameState light from red to blue', (done) => {
      const player1 = new Player('abcd', 'player1');
      const player2 = new Player('bcde', 'player2');

      userService.save(player1);
      userService.save(player2);

      const card = new TwistedCard('', SpecialEffect.SwitchLight);

      player1.addToHand(card);

      cardService.save(card);

      const table = new Table();

      tableService.save(table);

      const playedCardCommand = new PlayedCardCommand(gameService, serverSocket, {
        cardId: card.id,
        tableId: table.id,
        userId: player1.id,
        targetUserId: player2.id,
      });

      expect(gameState.light).toBe(Lights.RED);

      playedCardCommand.execute();

      expect(gameState.light).toBe(Lights.BLUE);

      done();
    });

    test('should swap the two players hands', (done) => {
      const player1 = new Player('abcd', 'player1');
      const player2 = new Player('bcde', 'player2');

      userService.save(player1);
      userService.save(player2);

      const card = new TwistedCard('', SpecialEffect.SwapHand);
      const card2 = new TwistedCard('', SpecialEffect.SneakAPeak);

      player1.addToHand(card);
      player2.addToHand(card2);

      cardService.save(card);

      const table = new Table();

      tableService.save(table);

      const playedCardCommand = new PlayedCardCommand(gameService, serverSocket, {
        cardId: card.id,
        tableId: table.id,
        userId: player1.id,
        targetUserId: player2.id,
      });

      playedCardCommand.execute();

      expect(player2.getHand().getCards()[0]).toBe(card);
      expect(player1.getHand().getCards()[0]).toBe(card2);

      done();
    });

    test('should throw UserNotFoundException exception', (done) => {
      const player1 = new Player('abcd', 'player1');
      const player2 = new Player('bcde', 'player2');

      userService.save(player1);
      userService.save(player2);

      const card = new Card('');

      player1.addToHand(card);

      cardService.save(card);

      const table = new Table();

      tableService.save(table);

      expect(() => {
        const playedCardCommand = new PlayedCardCommand(gameService, serverSocket, {
          cardId: card.id,
          tableId: table.id,
          userId: player1.id,
          targetUserId: 'eeeee1111',
        });

        playedCardCommand.execute();
      }).toThrow(UserNotFoundException);
      done();
    });

    test('should throw TableNotFoundException exception', (done) => {
      const player1 = new Player('abcd', 'player1');
      const player2 = new Player('bcde', 'player2');

      userService.save(player1);
      userService.save(player2);

      const card = new Card('');

      player1.addToHand(card);

      cardService.save(card);

      expect(() => {
        const playedCardCommand = new PlayedCardCommand(gameService, serverSocket, {
          cardId: card.id,
          tableId: randomUUID(),
          userId: player1.id,
          targetUserId: player2.id,
        });

        playedCardCommand.execute();
      }).toThrow(TableNotFoundException);
      done();
    });

    test('should throw CardNotInHandException exception', (done) => {
      const player1 = new Player('abcd', 'player1');
      const player2 = new Player('bcde', 'player2');

      userService.save(player1);
      userService.save(player2);

      const card = new Card('');

      cardService.save(card);

      expect(() => {
        const playedCardCommand = new PlayedCardCommand(gameService, serverSocket, {
          cardId: card.id,
          tableId: randomUUID(),
          userId: player1.id,
          targetUserId: player2.id,
        });

        playedCardCommand.execute();
      }).toThrow(CardNotInHandException);
      done();
    });

    test('should throw CardNotFoundException exception', (done) => {
      const player1 = new Player('abcd', 'player1');
      const player2 = new Player('bcde', 'player2');

      userService.save(player1);
      userService.save(player2);

      expect(() => {
        const playedCardCommand = new PlayedCardCommand(gameService, serverSocket, {
          cardId: randomUUID(),
          tableId: randomUUID(),
          userId: player1.id,
          targetUserId: player2.id,
        });

        playedCardCommand.execute();
      }).toThrow(CardNotFoundException);
      done();
    });

    test('should throw UserNotFoundException exception', (done) => {
      expect(() => {
        const playedCardCommand = new PlayedCardCommand(gameService, serverSocket, {
          cardId: randomUUID(),
          tableId: randomUUID(),
          userId: 'eeeee111',
          targetUserId: 'eeeee111',
        });

        playedCardCommand.execute();
      }).toThrow(UserNotFoundException);
      done();
    });

    test('should throw InvalidPayloadException exception', (done) => {
      expect(() => {
        const playedCardCommand = new PlayedCardCommand(gameService, serverSocket, {
          cardId: randomUUID(),
          tableId: 'not-uuid' as UUID,
          userId: 'abcd',
          targetUserId: 'abcd',
        });

        playedCardCommand.execute();
      }).toThrow(InvalidPayloadException);
      done();
    });
  });

  describe('UserReadyCommand', () => {
    test('should emit UserReady event when valid payload is provided', (done) => {
      const users = userService.findAll();
      const lobbies = lobbyService.findAll();

      const userReadyCommand = new UserReadyCommand(serverSocket, {
        userId: users[0].id,
        lobbyId: lobbies[0].id,
      });

      clientSocket.on('UserReady', (userId, lobbyId) => {
        expect(userId).toBeDefined();
        expect(lobbyId).toBeDefined();
        expect(userId).toBe(users[0].id);
        expect(lobbyId).toBe(lobbies[0].id);
        done();
      });

      userReadyCommand.execute();
    });
  });

  describe('handleConnection', () => {
    test('should register event listeners for each command', (done) => {
      // Define a mock command and payload
      class MockCommand implements Command {
        constructor(private socket: ServerSocket, private payload: any) { }

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
