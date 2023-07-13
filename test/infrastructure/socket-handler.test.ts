/* eslint-disable import/no-extraneous-dependencies */
import { UUID, randomUUID } from 'crypto';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server, Socket as ServerSocket } from 'socket.io';
import Client, { Socket as ClientSocket } from 'socket.io-client';
import CardDiscardedCommand from '../../src/application/commands/card-discarded.command';
import ChangeTurnCommand from '../../src/application/commands/change-turn.command';
import CreateLobbyCommand from '../../src/application/commands/create-lobby.command';
import GameOverCommand from '../../src/application/commands/game-over.command';
import JoinLobbyCommand from '../../src/application/commands/join-lobby.command';
import LeaveLobbyCommand from '../../src/application/commands/leave-lobby.command';
import PickedCardCommand from '../../src/application/commands/picked-card.command';
import PlayedCardCommand from '../../src/application/commands/played-card.command';
import SendMessageCommand from '../../src/application/commands/send-message.command';
import UserConnectCommand from '../../src/application/commands/user-connect.command';
import UserDisconnectCommand from '../../src/application/commands/user-disconnect.command';
import UserReadyCommand from '../../src/application/commands/user-ready.command';
import CardNotFoundException from '../../src/application/exceptions/card-not-found.exception';
import CardNotInHandException from '../../src/application/exceptions/card-not-in-hand.exception';
import FailedUserConnectionException from '../../src/application/exceptions/failed-user-connection.exception';
import GameHasNotEndedException from '../../src/application/exceptions/game-has-ended.exception';
import GameStateNotFoundException from '../../src/application/exceptions/game-state-not-found.exception';
import InvalidPayloadException from '../../src/application/exceptions/invalid-payload.exception';
import LobbyNotFoundException from '../../src/application/exceptions/lobby-not-found.exception';
import NoPlayersInGameException from '../../src/application/exceptions/no-players-in-game.exception';
import NotYourTurnException from '../../src/application/exceptions/not-your-turn.exception';
import OwnerNotFoundException from '../../src/application/exceptions/owner-not-found.exception';
import TableNotFoundException from '../../src/application/exceptions/table-not-found.exception';
import UserNotFoundException from '../../src/application/exceptions/user-not-found.exception';
import { CardService } from '../../src/application/services/card.service';
import { DeckService } from '../../src/application/services/deck.service';
import GameService from '../../src/application/services/game.service';
import { LobbyService } from '../../src/application/services/lobby.service';
import { TableService } from '../../src/application/services/table.service';
import { UserService } from '../../src/application/services/user.service';
import Card from '../../src/domain/entities/Card';
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
import { getShuffledDeck } from '../utils/test.utils';
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
    const port = 3002;

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

  describe('CreateLobbyCommand', () => {
    test('should emit LobbyCreated event when valid payload is provided', (done) => {
      const testUser = new Player(clientSocket.id, 'test');
      userService.save(testUser);

      const createLobbyCommand = new CreateLobbyCommand(gameService, io, serverSocket, {
        gameStateId: gameState.id,
      });

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
        const createLobbyCommand = new CreateLobbyCommand(gameService, io, mockSocket);

        createLobbyCommand.execute();
      }).toThrow(UserNotFoundException);
    });
  });

  describe('JoinLobbyCommand', () => {
    test('should emit UserJoinedLobby event when valid payload is provided', (done) => {
      const testLobby = new Lobby(new Player('1234', 'test2'));
      lobbyService.save(testLobby);

      const testUser = new Player(clientSocket.id, 'test', new Hand());
      userService.save(testUser);

      expect(testLobby.getPlayers().length).toBe(1);

      const joinLobbyCommand = new JoinLobbyCommand(gameService, io, serverSocket, {
        lobbyId: testLobby.id,
      });

      clientSocket.on('UserJoinedLobby', (response: Lobby) => {
        expect(response).toBeDefined();
        const lobby = gameService.getLobbyService().findById(response.id);
        expect(lobby).toBeInstanceOf(Lobby);
        expect(lobby?.getPlayers().length).toBe(2);

        done();
      });

      joinLobbyCommand.execute();
    });

    test('should throw UserNotFoundException when user is not found', () => {
      const lobby = new Lobby(new Player('1234', 'test'));
      gameService.getLobbyService().save(lobby);

      const mockSocket: any = {
        id: 'mock-socket-id',
      };

      expect(() => {
        const joinLobbyCommand = new JoinLobbyCommand(gameService, io, mockSocket, {
          lobbyId: lobby.id,
        });

        joinLobbyCommand.execute();
      }).toThrow(UserNotFoundException);
    });

    test('should throw LobbyNotFoundException when joining non-existing lobby', (done) => {
      expect(() => {
        const joinLobbyCommand = new JoinLobbyCommand(gameService, io, serverSocket, {
          lobbyId: randomUUID(),
        });

        joinLobbyCommand.execute();
      }).toThrow(LobbyNotFoundException);
      done();
    });

    test('should throw InvalidPayloadException when passing non UUID lobby id', (done) => {
      expect(() => {
        const joinLobbyCommand = new JoinLobbyCommand(gameService, io, serverSocket, {
          lobbyId: 'non-uuid-id' as UUID,
        });

        joinLobbyCommand.execute();
      }).toThrow(InvalidPayloadException);
      done();
    });
  });

  describe('PickedCardCommand', () => {
    test('should throw GameStateNotFoundException exception', (done) => {
      expect(() => {
        const player1 = new Player('abcd', 'player1');
        const player2 = new Player('bcde', 'player2');

        userService.save(player1);
        userService.save(player2);

        const card = new TwistedCard('', SpecialEffect.SwitchLight);

        player1.addToHand(card);

        cardService.save(card);

        const table = new Table();

        tableService.save(table);

        const pickedCardCommand = new PickedCardCommand(gameService, io, serverSocket, {
          cardId: card.id,
          gameStateId: randomUUID(),
          lobbyId: randomUUID(),
          userNewId: randomUUID(),
          userPreviousId: randomUUID(),
        });

        pickedCardCommand.execute();
      }).toThrow(GameStateNotFoundException);
      done();
    });

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
        const pickedCardCommand = new PickedCardCommand(gameService, io, serverSocket, {
          cardId: testCard.id,
          userPreviousId: previousId,
          userNewId: 'abcd1234',
          gameStateId: gameState.id,
          lobbyId: gameState.lobby!.id,
        });

        pickedCardCommand.execute();
      }).toThrow(UserNotFoundException);

      expect(() => {
        const pickedCardCommand = new PickedCardCommand(gameService, io, serverSocket, {
          cardId: testCard.id,
          userPreviousId: 'abcd1234',
          userNewId: newId,
          gameStateId: gameState.id,
          lobbyId: gameState.lobby!.id,
        });

        pickedCardCommand.execute();
      }).toThrow(UserNotFoundException);

      done();
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

        const pickedCardCommand = new PickedCardCommand(gameService, io, serverSocket, {
          cardId: testCard.id,
          userPreviousId: previousOwnerId,
          userNewId: newOwnerId,
          gameStateId: gameState.id,
          lobbyId: gameState.lobby!.id,
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

        const pickedCardCommand = new PickedCardCommand(gameService, io, serverSocket, {
          cardId: randomUUID(),
          userPreviousId: previousOwnerId,
          userNewId: newOwnerId,
          gameStateId: gameState.id,
          lobbyId: gameState.lobby!.id,
        });

        pickedCardCommand.execute();
      }).toThrow(CardNotFoundException);
      done();
    });
  });

  describe('LeaveLobbyCommand', () => {
    test('should throw InvalidPayloadException when passing non UUID lobby id', (done) => {
      expect(() => {
        const leaveLobbyCommand = new LeaveLobbyCommand(gameService, io, serverSocket, {
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
        const leaveLobbyCommand = new LeaveLobbyCommand(gameService, io, mockSocket, {
          lobbyId: randomUUID(),
        });

        leaveLobbyCommand.execute();
      }).toThrow(UserNotFoundException);
    });

    test('should throw LobbyNotFoundException when attempting to leave non-existing lobby', (done) => {
      expect(() => {
        const leaveLobbyCommand = new LeaveLobbyCommand(gameService, io, serverSocket, {
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

      const userConnectCommand = new UserConnectCommand(gameService, io, serverSocket, {
        username: 'test1234',
      });

      expect(() => userConnectCommand.execute()).toThrow(FailedUserConnectionException);

      jest.spyOn(gameService.getUserService(), 'findById').mockRestore();
    });

    test('should emit UserConnected event when valid payload is provided', (done) => {
      userRepository.clear();

      const userConnectCommand = new UserConnectCommand(gameService, io, serverSocket, {
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
        const userConnectCommand = new UserConnectCommand(gameService, io, serverSocket, {
          username: 'test',
        });

        userConnectCommand.execute();
      }).toThrow(FailedUserConnectionException);
      done();
    });

    test('should throw InvalidPayloadException when passing an empty username string', (done) => {
      expect(() => {
        const userConnectCommand = new UserConnectCommand(gameService, io, serverSocket, {
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

      const sendMessageCommand = new SendMessageCommand(gameService, io, serverSocket, {
        userId: users[0].id,
        lobbyId: lobbies[0].id,
        message: 'test',
      });

      clientSocket.on('MessageSent', (response: Lobby) => {
        expect(response).toBeDefined();
        const lobby = gameService.getLobbyService().findById(response.id);
        expect(lobby?.getMessages()).toHaveLength(1);
        done();
      });

      sendMessageCommand.execute();
    });

    test('should throw InvalidPayloadException when passing non UUID lobby id', (done) => {
      expect(() => {
        const sendMessageCommand = new SendMessageCommand(gameService, io, serverSocket, {
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

      // Register the command using the registerCommand method
      const socketHandler = new SocketHandler(io, gameService);

      socketHandler.registerCommand('CreateLobby', mockCommandClass);

      // Verify that the command is registered in the commandFactory
      const commandFactory = socketHandler.getCommands();
      expect(commandFactory.CreateLobby).toBeDefined();
    });
  });

  describe('ChangeTurnCommand', () => {
    test('should throw GameStateNotFoundException exception', (done) => {
      expect(() => {
        const changeTurnCommand = new ChangeTurnCommand(gameService, io, serverSocket, {
          gameStateId: randomUUID(),
          lobbyId: randomUUID(),
        });

        changeTurnCommand.execute();
      }).toThrow(GameStateNotFoundException);
      done();
    });

    test('should throw LobbyNotFoundException exception', (done) => {
      const lobby = new Lobby(new Player('1234', 'test'));
      lobby.setDeck(getShuffledDeck());
      gameState.setLobby(lobby);
      gameState.startGame();

      expect(() => {
        gameState.setLobby(undefined);
        const changeTurnCommand = new ChangeTurnCommand(gameService, io, serverSocket, {
          gameStateId: gameState.id,
          lobbyId: randomUUID(),
        });

        changeTurnCommand.execute();
      }).toThrow(LobbyNotFoundException);
      done();
    });

    test('should throw NotYourTurnException exception', (done) => {
      expect(() => {
        const lobby = new Lobby(new Player('1234', 'test'));
        lobby.setDeck(getShuffledDeck());
        gameState.setLobby(lobby);
        gameState.startGame();

        const changeTurnCommand = new ChangeTurnCommand(gameService, io, serverSocket, {
          gameStateId: gameState.id,
          lobbyId: gameState.lobby!.id,
        });

        changeTurnCommand.execute();
      }).toThrow(NotYourTurnException);
      done();
    });

    test('should throw NoPlayersInGameException exception', (done) => {
      expect(() => {
        gameState.lobby = new Lobby(new Player('1234', 'test'));
        gameState.lobby.removeUser('1234');

        const changeTurnCommand = new ChangeTurnCommand(gameService, io, serverSocket, {
          gameStateId: gameState.id,
          lobbyId: gameState.lobby!.id,
        });

        changeTurnCommand.execute();
      }).toThrow(NoPlayersInGameException);
      done();
    });
  });

  describe('PlayedCardCommand', () => {
    test('should throw GameStateNotFoundException exception', (done) => {
      expect(() => {
        const player1 = new Player('abcd', 'player1');
        const player2 = new Player('bcde', 'player2');

        userService.save(player1);
        userService.save(player2);

        const card = new TwistedCard('', SpecialEffect.SwitchLight);

        player1.addToHand(card);

        cardService.save(card);

        const table = new Table();

        tableService.save(table);

        const playedCardCommand = new PlayedCardCommand(gameService, io, serverSocket, {
          cardId: card.id,
          tableId: table.id,
          userId: player1.id,
          targetUserId: player2.id,
          gameStateId: randomUUID(),
          lobbyId: gameState.lobby!.id,
        });

        playedCardCommand.execute();
      }).toThrow(GameStateNotFoundException);
      done();
    });

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

      const playedCardCommand = new PlayedCardCommand(gameService, io, serverSocket, {
        cardId: card.id,
        tableId: table.id,
        userId: player1.id,
        targetUserId: player2.id,
        gameStateId: gameState.id,
        lobbyId: gameState.lobby!.id,
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

      const playedCardCommand = new PlayedCardCommand(gameService, io, serverSocket, {
        cardId: card.id,
        tableId: table.id,
        userId: player1.id,
        targetUserId: player2.id,
        gameStateId: gameState.id,
        lobbyId: gameState.lobby!.id,
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
        const playedCardCommand = new PlayedCardCommand(gameService, io, serverSocket, {
          cardId: card.id,
          tableId: table.id,
          userId: player1.id,
          targetUserId: 'eeeee1111',
          gameStateId: gameState.id,
          lobbyId: gameState.lobby!.id,
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
        const playedCardCommand = new PlayedCardCommand(gameService, io, serverSocket, {
          cardId: card.id,
          tableId: randomUUID(),
          userId: player1.id,
          targetUserId: player2.id,
          gameStateId: gameState.id,
          lobbyId: gameState.lobby!.id,
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
        const playedCardCommand = new PlayedCardCommand(gameService, io, serverSocket, {
          cardId: card.id,
          tableId: randomUUID(),
          userId: player1.id,
          targetUserId: player2.id,
          gameStateId: gameState.id,
          lobbyId: gameState.lobby!.id,
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
        const playedCardCommand = new PlayedCardCommand(gameService, io, serverSocket, {
          cardId: randomUUID(),
          tableId: randomUUID(),
          userId: player1.id,
          targetUserId: player2.id,
          gameStateId: gameState.id,
          lobbyId: gameState.lobby!.id,
        });

        playedCardCommand.execute();
      }).toThrow(CardNotFoundException);
      done();
    });

    test('should throw UserNotFoundException exception', (done) => {
      expect(() => {
        const playedCardCommand = new PlayedCardCommand(gameService, io, serverSocket, {
          cardId: randomUUID(),
          tableId: randomUUID(),
          userId: 'eeeee111',
          targetUserId: 'eeeee111',
          gameStateId: gameState.id,
          lobbyId: gameState.lobby!.id,
        });

        playedCardCommand.execute();
      }).toThrow(UserNotFoundException);
      done();
    });

    test('should throw InvalidPayloadException exception', (done) => {
      expect(() => {
        const playedCardCommand = new PlayedCardCommand(gameService, io, serverSocket, {
          cardId: randomUUID(),
          tableId: 'not-uuid' as UUID,
          userId: 'abcd',
          targetUserId: 'abcd',
          gameStateId: gameState.id,
          lobbyId: gameState.lobby!.id,
        });

        playedCardCommand.execute();
      }).toThrow(InvalidPayloadException);
      done();
    });
  });

  describe('CardDiscardedCommand', () => {
    test('should throw OwnerNotFoundException exception', (done) => {
      const card = new Card('');
      cardService.save(card);

      const player = new Player('1234', 'test');
      player.addToHand(card);

      gameState.lobby!.addUser(new Player('2345', 'test2'));

      expect(() => {
        const cardDiscardedCommand = new CardDiscardedCommand(gameService, io, serverSocket, {
          cardId: card.id,
          gameStateId: gameState.id,
          lobbyId: gameState.lobby!.id,
          userId: player.id,
        });

        cardDiscardedCommand.execute();
      }).toThrow(OwnerNotFoundException);
      done();
    });

    test('should throw NoPlayersInGameException exception', (done) => {
      const card = new Card('');
      cardService.save(card);

      gameState.lobby!.removeUser('1234');
      gameState.lobby!.removeUser('2345');

      expect(() => {
        const cardDiscardedCommand = new CardDiscardedCommand(gameService, io, serverSocket, {
          cardId: card.id,
          gameStateId: gameState.id,
          lobbyId: gameState.lobby!.id,
          userId: randomUUID(),
        });

        cardDiscardedCommand.execute();
      }).toThrow(NoPlayersInGameException);
      done();
    });

    test('should throw CardNotInHandException exception', (done) => {
      gameState.lobby!.addUser(new Player('2345', 'testing-2'));

      expect(() => {
        const cardDiscardedCommand = new CardDiscardedCommand(gameService, io, serverSocket, {
          cardId: randomUUID(),
          gameStateId: gameState.id,
          lobbyId: gameState.lobby!.id,
          userId: '2345',
        });

        cardDiscardedCommand.execute();
      }).toThrow(CardNotInHandException);
      done();
    });

    test('should throw LobbyNotFoundException exception', (done) => {
      const card = new Card('');
      cardService.save(card);

      expect(() => {
        gameState.setLobby(undefined);
        const cardDiscardedCommand = new CardDiscardedCommand(gameService, io, serverSocket, {
          cardId: card.id,
          gameStateId: gameState.id,
          lobbyId: randomUUID(),
          userId: randomUUID(),
        });

        cardDiscardedCommand.execute();
      }).toThrow(LobbyNotFoundException);
      done();
    });

    test('should throw GameStateNotFoundException exception', (done) => {
      expect(() => {
        const cardDiscardedCommand = new CardDiscardedCommand(gameService, io, serverSocket, {
          cardId: randomUUID(),
          gameStateId: randomUUID(),
          lobbyId: randomUUID(),
          userId: randomUUID(),
        });

        cardDiscardedCommand.execute();
      }).toThrow(GameStateNotFoundException);
      done();
    });

    test('should throw InvalidPayloadException exception', (done) => {
      expect(() => {
        const cardDiscardedCommand = new CardDiscardedCommand(gameService, io, serverSocket, {
          cardId: 'non-uuid' as UUID,
          gameStateId: randomUUID(),
          lobbyId: randomUUID(),
          userId: randomUUID(),
        });

        cardDiscardedCommand.execute();
      }).toThrow(InvalidPayloadException);
      done();
    });
  });

  describe('UserDisconnectedCommand', () => {
    test('should throw FailedUserConnectionException exception', (done) => {
      expect(() => {
        const userDisconnectCommand = new UserDisconnectCommand(gameService, io, serverSocket, {
          userId: randomUUID(),
          gameStateId: randomUUID(),
          lobbyId: randomUUID(),
        });

        userDisconnectCommand.execute();
      }).toThrow(FailedUserConnectionException);
      done();
    });

    test('should throw InvalidPayloadException exception', (done) => {
      expect(() => {
        const userDisconnectCommand = new UserDisconnectCommand(gameService, io, serverSocket, {
          userId: randomUUID(),
          gameStateId: 'non-uuid' as UUID,
          lobbyId: randomUUID(),
        });

        userDisconnectCommand.execute();
      }).toThrow(InvalidPayloadException);
      done();
    });
  });

  describe('GameOverCommand', () => {
    test('should throw GameHasNotEndedException exception', (done) => {
      const player = new Player('', 'test');
      player.addToHand(new Card(''));

      const lobby = new Lobby(player);
      lobby.addUser(player);

      lobbyService.save(lobby);

      gameState.setLobby(lobby);

      expect(() => {
        gameState.endGame();

        const gameOverCommand = new GameOverCommand(gameService, io, serverSocket, {
          lobbyId: gameState.lobby!.id,
          gameStateId: gameState.id,
        });

        gameOverCommand.execute();
      }).toThrow(GameHasNotEndedException);

      done();
    });

    test('should throw LobbyNotFoundException exception', (done) => {
      expect(() => {
        const gameOverCommand = new GameOverCommand(gameService, io, serverSocket, {
          lobbyId: randomUUID(),
          gameStateId: gameState.id,
        });

        gameOverCommand.execute();
      }).toThrow(LobbyNotFoundException);

      done();
    });

    test('should throw GameStateNotFoundException exception', (done) => {
      const lobby = new Lobby(new Player('1234', 'test'));

      gameState.setLobby(lobby);

      expect(() => {
        const gameOverCommand = new GameOverCommand(gameService, io, serverSocket, {
          lobbyId: gameState.lobby!.id,
          gameStateId: randomUUID(),
        });

        gameOverCommand.execute();
      }).toThrow(GameStateNotFoundException);

      done();
    });

    test('should throw InvalidPayloadException exception', (done) => {
      expect(() => {
        const gameOverCommand = new GameOverCommand(gameService, io, serverSocket, {
          lobbyId: 'non-uuid' as UUID,
          gameStateId: gameState.id,
        });

        gameOverCommand.execute();
      }).toThrow(InvalidPayloadException);

      done();
    });
  });

  describe('UserReadyCommand', () => {
    test('should emit UserReady event when valid payload is provided', (done) => {
      const users = userService.findAll();
      const lobbies = lobbyService.findAll();

      const userReadyCommand = new UserReadyCommand(gameService, io, serverSocket, {
        userId: users[0].id,
        lobbyId: lobbies[0].id,
      });

      clientSocket.on('UserReady', (lobby: Lobby) => {
        expect(lobby).toBeDefined();
        expect(lobby.id).toBe(lobbies[0].id);
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
        ChangeTurn: (socket, payload) => new mockCommandClass(socket, payload),
        StartGame: (socket, payload) => new mockCommandClass(socket, payload),
        CardDiscarded: (socket, payload) => new mockCommandClass(socket, payload),
        GameOver: (socket, payload) => new mockCommandClass(socket, payload),
        UserDisconnect: (socket, payload) => new mockCommandClass(socket, payload),
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
