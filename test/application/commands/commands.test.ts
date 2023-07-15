/* eslint-disable import/no-extraneous-dependencies */
import { UUID, randomUUID } from 'crypto';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server, Socket as ServerSocket } from 'socket.io';
import Client, { Socket as ClientSocket } from 'socket.io-client';
import CardDiscardedCommand from '../../../src/application/commands/card-discarded.command';
import ChangeTurnCommand from '../../../src/application/commands/change-turn.command';
import CreateLobbyCommand from '../../../src/application/commands/create-lobby.command';
import GameOverCommand from '../../../src/application/commands/game-over.command';
import JoinLobbyCommand from '../../../src/application/commands/join-lobby.command';
import LeaveLobbyCommand from '../../../src/application/commands/leave-lobby.command';
import MatchCardsCommand from '../../../src/application/commands/match-cards.command';
import PickedCardCommand from '../../../src/application/commands/picked-card.command';
import PlayedCardCommand from '../../../src/application/commands/played-card.command';
import SendMessageCommand from '../../../src/application/commands/send-message.command';
import StartGameCommand from '../../../src/application/commands/start-game.command';
import UserConnectCommand from '../../../src/application/commands/user-connect.command';
import UserDisconnectCommand from '../../../src/application/commands/user-disconnect.command';
import UserReadyCommand from '../../../src/application/commands/user-ready.command';
import CardNotFoundException from '../../../src/application/exceptions/card-not-found.exception';
import CardNotInHandException from '../../../src/application/exceptions/card-not-in-hand.exception';
import FailedUserConnectionException from '../../../src/application/exceptions/failed-user-connection.exception';
import GameHasNotEndedException from '../../../src/application/exceptions/game-has-ended.exception';
import GameStateNotFoundException from '../../../src/application/exceptions/game-state-not-found.exception';
import InvalidPayloadException from '../../../src/application/exceptions/invalid-payload.exception';
import LobbyNotFoundException from '../../../src/application/exceptions/lobby-not-found.exception';
import NoPlayersInGameException from '../../../src/application/exceptions/no-players-in-game.exception';
import NotYourTurnException from '../../../src/application/exceptions/not-your-turn.exception';
import OwnerNotFoundException from '../../../src/application/exceptions/owner-not-found.exception';
import TableNotFoundException from '../../../src/application/exceptions/table-not-found.exception';
import UserNotFoundException from '../../../src/application/exceptions/user-not-found.exception';
import { CardService } from '../../../src/application/services/card.service';
import { DeckService } from '../../../src/application/services/deck.service';
import GameService from '../../../src/application/services/game.service';
import { LobbyService } from '../../../src/application/services/lobby.service';
import { TableService } from '../../../src/application/services/table.service';
import { UserService } from '../../../src/application/services/user.service';
import Card from '../../../src/domain/entities/Card';
import Deck from '../../../src/domain/entities/Deck';
import GameState, { Lights } from '../../../src/domain/entities/GameState';
import { Lobby } from '../../../src/domain/entities/Lobby';
import Player from '../../../src/domain/entities/Player';
import Table from '../../../src/domain/entities/Table';
import TwistedCard, { SpecialEffect } from '../../../src/domain/entities/TwistedCard';
import { CardRepository } from '../../../src/domain/repositories/card-repository.interface';
import { DeckRepository } from '../../../src/domain/repositories/deck-repository.interface';
import { LobbyRepository } from '../../../src/domain/repositories/lobby-repository.interface';
import { TableRepository } from '../../../src/domain/repositories/table-repository.interface';
import { UserRepository } from '../../../src/domain/repositories/user-repository.interface';
import { InMemoryCardRepository } from '../../../src/infrastructure/repositories/in-memory-card.repository';
import { InMemoryDeckRepository } from '../../../src/infrastructure/repositories/in-memory-deck.repository';
import { InMemoryLobbyRepository } from '../../../src/infrastructure/repositories/in-memory-lobby.repository';
import { InMemoryTableRepository } from '../../../src/infrastructure/repositories/in-memory-table.repository';
import { InMemoryUserRepository } from '../../../src/infrastructure/repositories/in-memory-user.repository';
import { getShuffledDeck } from '../../utils/test.utils';
dotenv.config();

describe('End to End tests', () => {
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
  let testLobby: Lobby;
  let testPlayer: Player;
  let card1: Card;
  let card2: Card;

  beforeEach((done) => {
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
    testPlayer = new Player('1234', 'testing');
    card1 = new Card(0);
    card2 = new Card(0);
    testPlayer.addManyToHand([card1, card2]);
    testLobby = new Lobby(testPlayer);
    lobbyService.save(testLobby);
    userService.save(testPlayer);
    cardService.saveMany([card1, card2]);
    gameState.setLobby(testLobby);
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

    jest.setTimeout(10000);
  });

  afterEach(() => {
    io.close();
    serverSocket.disconnect();
    clientSocket.close();
  });

  describe('StartGameCommand', () => {
    test('should throw LobbyNotFoundException exception', (done) => {
      expect(() => {
        const changeTurnCommand = new StartGameCommand(gameService, io, serverSocket, {
          lobbyId: randomUUID(),
        });

        changeTurnCommand.execute();
      }).toThrow(LobbyNotFoundException);
      done();
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
    test('should do nothing special', (done) => {
      expect(() => {
        const player1 = new Player('abcd', 'player1');
        const player2 = new Player('bcde', 'player2');

        userService.save(player1);
        userService.save(player2);

        const card = new TwistedCard(0, SpecialEffect.SneakAPeak);

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

        playedCardCommand.execute();
      });
      done();
    });

    test('should throw GameStateNotFoundException exception', (done) => {
      expect(() => {
        const player1 = new Player('abcd', 'player1');
        const player2 = new Player('bcde', 'player2');

        userService.save(player1);
        userService.save(player2);

        const card = new TwistedCard(0, SpecialEffect.SwitchLight);

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

    test('should switch the GameState light from red to blue then back to red', (done) => {
      const player1 = new Player('abcd', 'player1');
      const player2 = new Player('bcde', 'player2');

      userService.save(player1);
      userService.save(player2);

      const card = new TwistedCard(0, SpecialEffect.SwitchLight);

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

      const card2 = new TwistedCard(0, SpecialEffect.SwitchLight);

      player1.addToHand(card2);

      cardService.save(card2);

      const playedCardCommand2 = new PlayedCardCommand(gameService, io, serverSocket, {
        cardId: card2.id,
        tableId: table.id,
        userId: player1.id,
        targetUserId: player2.id,
        gameStateId: gameState.id,
        lobbyId: gameState.lobby!.id,
      });

      playedCardCommand2.execute();

      expect(gameState.light).toBe(Lights.RED);

      done();
    });

    test('should swap the two players hands', (done) => {
      const player1 = new Player('abcd', 'player1');
      const player2 = new Player('bcde', 'player2');

      userService.save(player1);
      userService.save(player2);

      const card = new TwistedCard(0, SpecialEffect.SwapHand);
      const card2 = new TwistedCard(0, SpecialEffect.SneakAPeak);

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

      const card = new Card(0);

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

      const card = new Card(0);

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

      const card = new Card(0);

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

  describe('CreateLobbyCommand', () => {
    test('should emit LobbyCreated event when valid payload is provided', (done) => {
      const testUser = new Player(clientSocket.id, 'test');
      userService.save(testUser);

      const createLobbyCommand = new CreateLobbyCommand(gameService, io, serverSocket, {
        gameStateId: gameState.id,
      });

      clientSocket.on('LobbyCreated', (lobby: Lobby) => {
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
    beforeEach(() => {
      const newPlayer = new Player(serverSocket.id, 'test2');
      gameService.getUserService().save(newPlayer);
      testLobby.addUser(newPlayer);
    });

    test('should emit UserJoinedLobby event when valid payload is provided', (done) => {
      expect(testLobby.getPlayers().length).toBe(2);

      const joinLobbyCommand = new JoinLobbyCommand(gameService, io, serverSocket, {
        lobbyId: testLobby.id,
      });

      clientSocket.on('UserJoinedLobby', (response: Lobby) => {
        expect(response).toBeDefined();
        const lobby = gameService.getLobbyService().findById(response.id);
        expect(lobby).toBeInstanceOf(Lobby);
        expect(lobby?.getPlayers().length).toBe(3);

        done();
      });

      joinLobbyCommand.execute();
    });

    test('should throw UserNotFoundException when user is not found', () => {
      const mockSocket: any = {
        id: 'mock-socket-id',
      };

      expect(() => {
        const joinLobbyCommand = new JoinLobbyCommand(gameService, io, mockSocket, {
          lobbyId: testLobby.id,
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

  describe('MatchCardsCommand', () => {
    beforeEach(() => {
      const newPlayer = new Player(serverSocket.id, 'test2');
      gameService.getUserService().save(newPlayer);
      testLobby.addUser(newPlayer);
    });

    test('should match two of the players card and dispose them', (done) => {
      expect(testPlayer.getHand().getCards().length).toBe(2);
      expect(testPlayer.getHand().getCards().includes(card1)).toBe(true);
      expect(testPlayer.getHand().getCards().includes(card2)).toBe(true);

      const matchCardsCommand = new MatchCardsCommand(gameService, io, serverSocket, {
        card1Id: card1.id,
        card2Id: card2.id,
        gameStateId: gameState.id,
        lobbyId: gameState.lobby!.id,
        userId: testPlayer.id,
      });
      matchCardsCommand.execute();

      expect(testPlayer.getHand().getCards().length).toBe(0);
      expect(testPlayer.getHand().getCards().includes(card1)).toBe(false);
      expect(testPlayer.getHand().getCards().includes(card2)).toBe(false);
      expect(gameState.table.getDisposedCards().length).toBe(2);
      expect(gameState.table.getDisposedCards().includes(card1)).toBe(true);
      expect(gameState.table.getDisposedCards().includes(card2)).toBe(true);
      done();
    });

    test('should throw CardNotInHandException exception', (done) => {
      testPlayer.removeFromHand(card1);

      expect(() => {
        const matchCardsCommand = new MatchCardsCommand(gameService, io, serverSocket, {
          card1Id: card1.id,
          card2Id: card2.id,
          gameStateId: gameState.id,
          lobbyId: gameState.lobby!.id,
          userId: serverSocket.id,
        });
        matchCardsCommand.execute();
      }).toThrow(CardNotInHandException);

      done();
    });

    test('should throw CardNotInHandException exception', (done) => {
      testPlayer.addToHand(card1);
      testPlayer.removeFromHand(card2);

      expect(() => {
        const matchCardsCommand = new MatchCardsCommand(gameService, io, serverSocket, {
          card1Id: card1.id,
          card2Id: card2.id,
          gameStateId: gameState.id,
          lobbyId: gameState.lobby!.id,
          userId: serverSocket.id,
        });
        matchCardsCommand.execute();
      }).toThrow(CardNotInHandException);

      done();
    });

    test('should throw CardNotFoundException exception', (done) => {
      gameService.getCardService().removeMany([card1]);

      expect(() => {
        const matchCardsCommand = new MatchCardsCommand(gameService, io, serverSocket, {
          card1Id: card1.id,
          card2Id: card2.id,
          gameStateId: gameState.id,
          lobbyId: gameState.lobby!.id,
          userId: serverSocket.id,
        });
        matchCardsCommand.execute();
      }).toThrow(CardNotFoundException);

      done();
    });

    test('should throw UserNotFoundException exception', (done) => {
      expect(() => {
        const matchCardsCommand = new MatchCardsCommand(gameService, io, serverSocket, {
          card1Id: randomUUID(),
          card2Id: randomUUID(),
          gameStateId: gameState.id,
          lobbyId: gameState.lobby!.id,
          userId: 'non-existing-user',
        });
        matchCardsCommand.execute();
      }).toThrow(UserNotFoundException);
      done();
    });

    test('should throw LobbyNotFoundException exception', (done) => {
      expect(() => {
        const matchCardsCommand = new MatchCardsCommand(gameService, io, serverSocket, {
          card1Id: randomUUID(),
          card2Id: randomUUID(),
          gameStateId: gameState.id,
          lobbyId: randomUUID(),
          userId: serverSocket.id,
        });
        matchCardsCommand.execute();
      }).toThrow(LobbyNotFoundException);
      done();
    });

    test('should throw GameStateNotFoundException exception', (done) => {
      expect(() => {
        const matchCardsCommand = new MatchCardsCommand(gameService, io, serverSocket, {
          card1Id: randomUUID(),
          card2Id: randomUUID(),
          gameStateId: randomUUID(),
          lobbyId: gameState.lobby!.id,
          userId: serverSocket.id,
        });
        matchCardsCommand.execute();
      }).toThrow(GameStateNotFoundException);
      done();
    });

    test('should throw InvalidPayloadException exception', (done) => {
      expect(() => {
        const matchCardsCommand = new MatchCardsCommand(gameService, io, serverSocket, {
          card1Id: '1234' as UUID,
          card2Id: randomUUID(),
          gameStateId: gameState.id,
          lobbyId: gameState.lobby!.id,
          userId: serverSocket.id,
        });
        matchCardsCommand.execute();
      }).toThrow(InvalidPayloadException);
      done();
    });
  });

  describe('PickedCardCommand', () => {
    test('player1 should take a card from player2s hand', (done) => {
      const player1 = new Player('abcd', 'player1');
      const player2 = new Player('bcde', 'player2');

      userService.save(player1);
      userService.save(player2);

      const card = new TwistedCard(0, SpecialEffect.SwitchLight);

      player1.addToHand(card);

      cardService.save(card);

      const table = new Table();

      tableService.save(table);

      const lobby = new Lobby(player1);

      const deck = new Deck();

      lobby.setDeck(deck);

      gameState.setLobby(lobby);

      gameState.startGame();

      expect(player1.getHand().getCards().includes(card)).toBe(true);
      expect(player2.getHand().getCards().includes(card)).toBe(false);

      const pickedCardCommand = new PickedCardCommand(gameService, io, serverSocket, {
        cardId: card.id,
        gameStateId: gameState.id,
        lobbyId: gameState.lobby!.id,
        userNewId: player2.id,
        userPreviousId: player1.id,
      });
      pickedCardCommand.execute();

      expect(player1.getHand().getCards().includes(card)).toBe(false);
      expect(player2.getHand().getCards().includes(card)).toBe(true);

      done();
    });

    test('should throw GameStateNotFoundException exception', (done) => {
      expect(() => {
        const player1 = new Player('abcd', 'player1');
        const player2 = new Player('bcde', 'player2');

        userService.save(player1);
        userService.save(player2);

        const card = new TwistedCard(0, SpecialEffect.SwitchLight);

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
      const testCard = new Card(0);
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
        const testCard = new Card(0);
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
    beforeEach(() => {
      const newPlayer = new Player(serverSocket.id, 'test2');
      gameService.getUserService().save(newPlayer);
      testLobby.addUser(newPlayer);
    });

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
    beforeEach(() => {
      const newPlayer = new Player(serverSocket.id, 'test2');
      gameService.getUserService().save(newPlayer);
      testLobby.addUser(newPlayer);
    });

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
    beforeEach(() => {
      const newPlayer = new Player(serverSocket.id, 'test2');
      gameService.getUserService().save(newPlayer);
      testLobby.addUser(newPlayer);
    });

    test('should throw UserNotFoundException exception', (done) => {
      expect(() => {
        const sendMessageCommand = new SendMessageCommand(gameService, io, serverSocket, {
          lobbyId: randomUUID(),
          message: '1234',
          userId: randomUUID(),
        });

        sendMessageCommand.execute();
      }).toThrow(UserNotFoundException);
      done();
    });

    test('should throw LobbyNotFoundException exception', (done) => {
      expect(() => {
        const sendMessageCommand = new SendMessageCommand(gameService, io, serverSocket, {
          lobbyId: randomUUID(),
          message: '1234',
          userId: serverSocket.id,
        });

        sendMessageCommand.execute();
      }).toThrow(LobbyNotFoundException);
      done();
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

  describe('CardDiscardedCommand', () => {
    test('should throw OwnerNotFoundException exception', (done) => {
      expect(() => {
        const cardDiscardedCommand = new CardDiscardedCommand(gameService, io, serverSocket, {
          cardId: card1.id,
          gameStateId: gameState.id,
          lobbyId: gameState.lobby!.id,
          userId: randomUUID(),
        });

        cardDiscardedCommand.execute();
      }).toThrow(OwnerNotFoundException);
      done();
    });

    test('should throw NoPlayersInGameException exception', (done) => {
      const card = new Card(0);
      cardService.save(card);

      gameState.setLobby(new Lobby(new Player('1', '1')));
      gameState.lobby!.removeUser('1');

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
      const card = new Card(0);
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
    test('should remove user from lobby and lobby from lobby repository', (done) => {
      const player = new Player('1234', 'test');
      gameService.getUserService().save(player);
      const lobby = new Lobby(player);
      gameService.getLobbyService().save(lobby);

      expect(gameService.getLobbyService().findById(lobby.id)).toBeDefined();

      const userDisconnectCommand = new UserDisconnectCommand(gameService, io, serverSocket, {
        userId: player.id,
        gameStateId: gameState.id,
        lobbyId: lobby.id,
      });

      userDisconnectCommand.execute();

      expect(gameService.getLobbyService().findById(lobby.id)).toBeUndefined();

      done();
    });

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
      player.addToHand(new Card(0));

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
    test('should throw UserNotFoundException exception', (done) => {
      expect(() => {
        const userReadyCommand = new UserReadyCommand(gameService, io, serverSocket, {
          userId: randomUUID(),
          lobbyId: testLobby.id,
        });
        userReadyCommand.execute();
      }).toThrow(UserNotFoundException);
      done();
    });

    test('should throw LobbyNotFoundException exception', (done) => {
      expect(() => {
        const userReadyCommand = new UserReadyCommand(gameService, io, serverSocket, {
          userId: testPlayer.id,
          lobbyId: randomUUID(),
        });
        userReadyCommand.execute();
      }).toThrow(LobbyNotFoundException);
      done();
    });
  });
});
