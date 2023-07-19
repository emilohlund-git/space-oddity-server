import { UUID, randomUUID } from 'crypto';
import dotenv from 'dotenv';
import { Server as HttpServer, createServer } from 'http';
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
import PingCommand from '../../../src/application/commands/ping.command';
import PlayedCardCommand from '../../../src/application/commands/played-card.command';
import RetrieveGameStateCommand from '../../../src/application/commands/retrieve-game-state.command';
import SaveGameStateCommand from '../../../src/application/commands/save-game-state.command';
import SendMessageCommand from '../../../src/application/commands/send-message.command';
import StartGameCommand from '../../../src/application/commands/start-game.command';
import UserConnectCommand from '../../../src/application/commands/user-connect.command';
import UserDisconnectCommand from '../../../src/application/commands/user-disconnect.command';
import UserReadyCommand from '../../../src/application/commands/user-ready.command';
import CardNotFoundException from '../../../src/application/exceptions/card-not-found.exception';
import CardNotInHandException from '../../../src/application/exceptions/card-not-in-hand.exception';
import DeckNotFoundException from '../../../src/application/exceptions/deck-not-found.exception';
import FailedToRetrieveGameStateException from '../../../src/application/exceptions/failed-to-retrieve-game-state.exception';
import FailedUserConnectionException from '../../../src/application/exceptions/failed-user-connection.exception';
import GameHasNotEndedException from '../../../src/application/exceptions/game-has-ended.exception';
import GameStateNotFoundException from '../../../src/application/exceptions/game-state-not-found.exception';
import InvalidPayloadException from '../../../src/application/exceptions/invalid-payload.exception';
import LobbyNotFoundException from '../../../src/application/exceptions/lobby-not-found.exception';
import NoPlayersInGameException from '../../../src/application/exceptions/no-players-in-game.exception';
import NotYourTurnException from '../../../src/application/exceptions/not-your-turn.exception';
import PlayerNotInLobbyException from '../../../src/application/exceptions/player-not-in-lobby.exception';
import TableNotFoundException from '../../../src/application/exceptions/table-not-found.exception';
import UserNotFoundException from '../../../src/application/exceptions/user-not-found.exception';
import { FileService, GameStateJson } from '../../../src/application/services/file.service';
import GameService from '../../../src/application/services/game.service';
import Card from '../../../src/domain/entities/Card';
import Deck from '../../../src/domain/entities/Deck';
import GameState, { GameStatus, Lights } from '../../../src/domain/entities/GameState';
import Hand from '../../../src/domain/entities/Hand';
import { Lobby } from '../../../src/domain/entities/Lobby';
import Player from '../../../src/domain/entities/Player';
import Table from '../../../src/domain/entities/Table';
import TwistedCard, { SpecialEffect } from '../../../src/domain/entities/TwistedCard';
import { mockGameService } from '../../utils/game-service.mock';
dotenv.config();

jest.mock('fs/promises');

describe('Commands', () => {
  let io: Server;
  let testLobby: Lobby;
  let testPlayers: Player[];
  let serverSocket: ServerSocket;
  let clientSocket: ClientSocket;
  let gameService: GameService;
  let gameState: GameState;
  let httpServer: HttpServer;

  beforeEach(() => {
    const { mockedLobby, mockedGameService, mockedGameState } = mockGameService();
    gameState = mockedGameState;
    gameService = mockedGameService;
    testLobby = mockedLobby;
    testPlayers = mockedLobby.getPlayers();
  });

  beforeAll((done) => {
    httpServer = createServer();
    io = new Server(httpServer);
    const port = 3005;

    httpServer.listen(port, () => {
      clientSocket = Client(`http://localhost:${port}`);
      io.on('connection', (socket) => {
        serverSocket = socket;
      });
      clientSocket.on('connect', done);
    });
  });

  afterAll(() => {
    httpServer.close();
    httpServer.unref();
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
    test('should change turn from player1 to player2', (done) => {
      expect(gameState.getCurrentPlayer()).toBe(testPlayers[0]);

      const changeTurnCommand = new ChangeTurnCommand(gameService, io, serverSocket, {
        gameStateId: gameState.id,
        lobbyId: testLobby.id,
        playerId: testPlayers[0].id,
      });

      changeTurnCommand.execute();

      expect(gameState.getCurrentPlayer()).toBe(testPlayers[1]);

      done();
    });

    test('should throw GameStateNotFoundException exception', (done) => {
      expect(() => {
        const changeTurnCommand = new ChangeTurnCommand(gameService, io, serverSocket, {
          gameStateId: randomUUID(),
          lobbyId: randomUUID(),
          playerId: randomUUID(),
        });

        changeTurnCommand.execute();
      }).toThrow(GameStateNotFoundException);
      done();
    });

    test('should throw LobbyNotFoundException exception', (done) => {
      expect(() => {
        gameState.setLobby(undefined);
        const changeTurnCommand = new ChangeTurnCommand(gameService, io, serverSocket, {
          gameStateId: gameState.id,
          lobbyId: randomUUID(),
          playerId: testPlayers[0].id,
        });

        changeTurnCommand.execute();
      }).toThrow(LobbyNotFoundException);
      done();
    });

    test('should throw NotYourTurnException exception', (done) => {
      expect(() => {
        const changeTurnCommand = new ChangeTurnCommand(gameService, io, serverSocket, {
          gameStateId: gameState.id,
          lobbyId: testLobby.id,
          playerId: testPlayers[1].id,
        });

        changeTurnCommand.execute();
      }).toThrow(NotYourTurnException);
      done();
    });

    test('should throw NoPlayersInGameException exception', (done) => {
      expect(() => {
        testLobby.removeUser(testPlayers[0].id);
        testLobby.setPlayers([]);
        const changeTurnCommand = new ChangeTurnCommand(gameService, io, serverSocket, {
          gameStateId: gameState.id,
          lobbyId: testLobby.id,
          playerId: randomUUID(),
        });

        changeTurnCommand.execute();
      }).toThrow(NoPlayersInGameException);
      done();
    });
  });

  describe('PlayedCardCommand', () => {
    test('should do nothing special', (done) => {
      expect(() => {
        const playedCardCommand = new PlayedCardCommand(gameService, io, serverSocket, {
          cardId: testPlayers[0].getHand().getCards()[0].id,
          tableId: gameState.table.id,
          playerId: testPlayers[0].id,
          targetPlayerId: testPlayers[1].id,
          gameStateId: gameState.id,
          lobbyId: testLobby.id,
        });

        playedCardCommand.execute();
      });
      done();
    });

    test('should throw GameStateNotFoundException exception', (done) => {
      expect(() => {
        const playedCardCommand = new PlayedCardCommand(gameService, io, serverSocket, {
          cardId: testPlayers[0].getHand().getCards()[0].id,
          tableId: gameState.table.id,
          playerId: testPlayers[0].id,
          targetPlayerId: testPlayers[1].id,
          gameStateId: randomUUID(),
          lobbyId: testLobby.id,
        });

        playedCardCommand.execute();
      }).toThrow(GameStateNotFoundException);
      done();
    });

    test('should switch the GameState light from red to blue then back to red', (done) => {
      const card = new TwistedCard(24, SpecialEffect.SwitchLight);
      gameService.getCardService().save(card);
      testPlayers[0].addToHand(card);

      const playedCardCommand = new PlayedCardCommand(gameService, io, serverSocket, {
        cardId: card.id,
        tableId: gameState.table.id,
        playerId: testPlayers[0].id,
        targetPlayerId: testPlayers[1].id,
        gameStateId: gameState.id,
        lobbyId: testLobby.id,
      });

      expect(gameState.light).toBe(Lights.BLUE);

      playedCardCommand.execute();

      expect(gameState.light).toBe(Lights.RED);

      const card2 = new TwistedCard(0, SpecialEffect.SwitchLight);
      gameService.getCardService().save(card2);
      testPlayers[0].addToHand(card2);

      const playedCardCommand2 = new PlayedCardCommand(gameService, io, serverSocket, {
        cardId: card2.id,
        tableId: gameState.table.id,
        playerId: testPlayers[0].id,
        targetPlayerId: testPlayers[1].id,
        gameStateId: gameState.id,
        lobbyId: testLobby.id,
      });

      playedCardCommand2.execute();

      expect(gameState.light).toBe(Lights.BLUE);

      done();
    });

    test('should swap the two players hands', (done) => {
      const card1 = new TwistedCard(0, SpecialEffect.SwapHand);
      const card2 = new TwistedCard(0, SpecialEffect.SneakAPeak);
      gameService.getCardService().saveMany([card1, card2]);

      testPlayers[0].addManyToHand([card1, card2]);

      const playedCardCommand = new PlayedCardCommand(gameService, io, serverSocket, {
        cardId: card1.id,
        tableId: gameState.table.id,
        playerId: testPlayers[0].id,
        targetPlayerId: testPlayers[1].id,
        gameStateId: gameState.id,
        lobbyId: testLobby.id,
      });

      playedCardCommand.execute();

      expect(testPlayers[0].getHand().getCards().includes(card1)).toBe(false);
      expect(testPlayers[0].getHand().getCards().includes(card2)).toBe(false);
      expect(testPlayers[1].getHand().getCards().includes(card2)).toBe(true);

      done();
    });

    test('should throw UserNotFoundException exception', (done) => {
      expect(() => {
        const playedCardCommand = new PlayedCardCommand(gameService, io, serverSocket, {
          cardId: testPlayers[0].getHand().getCards()[0].id,
          tableId: gameState.table.id,
          playerId: testPlayers[0].id,
          targetPlayerId: randomUUID(),
          gameStateId: gameState.id,
          lobbyId: testLobby.id,
        });

        playedCardCommand.execute();
      }).toThrow(UserNotFoundException);
      done();
    });

    test('should throw TableNotFoundException exception', (done) => {
      expect(() => {
        const playedCardCommand = new PlayedCardCommand(gameService, io, serverSocket, {
          cardId: testPlayers[0].getHand().getCards()[0].id,
          tableId: randomUUID(),
          playerId: testPlayers[0].id,
          targetPlayerId: testPlayers[1].id,
          gameStateId: gameState.id,
          lobbyId: testLobby.id,
        });

        playedCardCommand.execute();
      }).toThrow(TableNotFoundException);
      done();
    });

    test('should throw CardNotInHandException exception', (done) => {
      expect(() => {
        const card = new Card(0);
        gameService.getCardService().save(card);

        const playedCardCommand = new PlayedCardCommand(gameService, io, serverSocket, {
          cardId: card.id,
          tableId: randomUUID(),
          playerId: testPlayers[0].id,
          targetPlayerId: testPlayers[1].id,
          gameStateId: gameState.id,
          lobbyId: testLobby.id,
        });

        playedCardCommand.execute();
      }).toThrow(CardNotInHandException);
      done();
    });

    test('should throw CardNotFoundException exception', (done) => {
      expect(() => {
        const playedCardCommand = new PlayedCardCommand(gameService, io, serverSocket, {
          cardId: randomUUID(),
          tableId: randomUUID(),
          playerId: testPlayers[0].id,
          targetPlayerId: testPlayers[1].id,
          gameStateId: gameState.id,
          lobbyId: testLobby.id,
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
          playerId: randomUUID(),
          targetPlayerId: randomUUID(),
          gameStateId: gameState.id,
          lobbyId: testLobby.id,
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
          playerId: randomUUID(),
          targetPlayerId: randomUUID(),
          gameStateId: gameState.id,
          lobbyId: testLobby.id,
        });

        playedCardCommand.execute();
      }).toThrow(InvalidPayloadException);
      done();
    });
  });

  describe('CreateLobbyCommand', () => {
    test('should emit LobbyCreated event when valid payload is provided', (done) => {
      const createLobbyCommand = new CreateLobbyCommand(gameService, io, serverSocket, {
        playerId: testPlayers[0].id,
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
        const createLobbyCommand = new CreateLobbyCommand(gameService, io, mockSocket, {
          playerId: randomUUID(),
        });

        createLobbyCommand.execute();
      }).toThrow(UserNotFoundException);
    });
  });

  describe('JoinLobbyCommand', () => {
    test('should emit UserJoinedLobby event when valid payload is provided', (done) => {
      expect(testLobby.getPlayers().length).toBe(2);

      const player3 = new Player('Player3', new Hand(), randomUUID());
      gameService.getUserService().save(player3);

      const joinLobbyCommand = new JoinLobbyCommand(gameService, io, serverSocket, {
        lobbyId: testLobby.id,
        playerId: player3.id,
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
        join: () => { },
      };

      expect(() => {
        const joinLobbyCommand = new JoinLobbyCommand(gameService, io, mockSocket, {
          lobbyId: testLobby.id,
          playerId: randomUUID(),
        });

        joinLobbyCommand.execute();
      }).toThrow(UserNotFoundException);
    });

    test('should throw LobbyNotFoundException when joining non-existing lobby', (done) => {
      expect(() => {
        const joinLobbyCommand = new JoinLobbyCommand(gameService, io, serverSocket, {
          lobbyId: randomUUID(),
          playerId: testPlayers[0].id,
        });

        joinLobbyCommand.execute();
      }).toThrow(LobbyNotFoundException);
      done();
    });

    test('should throw InvalidPayloadException when passing non UUID lobby id', (done) => {
      expect(() => {
        const joinLobbyCommand = new JoinLobbyCommand(gameService, io, serverSocket, {
          lobbyId: 'non-uuid-id' as UUID,
          playerId: testPlayers[0].id,
        });

        joinLobbyCommand.execute();
      }).toThrow(InvalidPayloadException);
      done();
    });
  });

  describe('MatchCardsCommand', () => {
    test('should match two of the players card and dispose them', (done) => {
      const card1 = new Card(2);
      const card2 = new Card(2);
      gameService.getCardService().saveMany([card1, card2]);
      testPlayers[0].addManyToHand([card1, card2]);

      const testPlayer0HandSize = testPlayers[0].getHand().getCards().length;

      const matchCardsCommand = new MatchCardsCommand(gameService, io, serverSocket, {
        card1Id: card1.id,
        card2Id: card2.id,
        gameStateId: gameState.id,
        lobbyId: testLobby.id,
        playerId: testPlayers[0].id,
      });
      matchCardsCommand.execute();

      expect(testPlayers[0].getHand().getCards().length).toBe(testPlayer0HandSize - 2);
      expect(testPlayers[0].getHand().getCards().includes(card1)).toBe(false);
      expect(testPlayers[0].getHand().getCards().includes(card2)).toBe(false);
      expect(gameState.table.getDisposedCards().length).toBe(2);
      expect(gameState.table.getDisposedCards().includes(card1)).toBe(true);
      expect(gameState.table.getDisposedCards().includes(card2)).toBe(true);
      done();
    });

    test('should throw CardNotInHandException exception', (done) => {
      const card1 = new Card(2);
      const card2 = new Card(2);
      gameService.getCardService().saveMany([card1, card2]);
      testPlayers[0].addToHand(card2);

      expect(() => {
        const matchCardsCommand = new MatchCardsCommand(gameService, io, serverSocket, {
          card1Id: card1.id,
          card2Id: card2.id,
          gameStateId: gameState.id,
          lobbyId: testLobby.id,
          playerId: testPlayers[0].id,
        });
        matchCardsCommand.execute();
      }).toThrow(CardNotInHandException);

      done();
    });

    test('should throw CardNotInHandException exception', (done) => {
      const card1 = new Card(2);
      const card2 = new Card(2);
      gameService.getCardService().saveMany([card1, card2]);
      testPlayers[0].addToHand(card1);

      expect(() => {
        const matchCardsCommand = new MatchCardsCommand(gameService, io, serverSocket, {
          card1Id: card1.id,
          card2Id: card2.id,
          gameStateId: gameState.id,
          lobbyId: testLobby.id,
          playerId: testPlayers[0].id,
        });
        matchCardsCommand.execute();
      }).toThrow(CardNotInHandException);

      done();
    });

    test('should throw CardNotFoundException exception', (done) => {
      const card1 = new Card(2);
      const card2 = new Card(2);
      gameService.getCardService().save(card1);
      testPlayers[0].addToHand(card1);

      expect(() => {
        const matchCardsCommand = new MatchCardsCommand(gameService, io, serverSocket, {
          card1Id: card1.id,
          card2Id: card2.id,
          gameStateId: gameState.id,
          lobbyId: testLobby.id,
          playerId: testPlayers[0].id,
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
          lobbyId: testLobby.id,
          playerId: randomUUID(),
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
          playerId: testPlayers[0].id,
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
          lobbyId: testLobby.id,
          playerId: testPlayers[0].id,
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
          lobbyId: testLobby.id,
          playerId: testPlayers[0].id,
        });
        matchCardsCommand.execute();
      }).toThrow(InvalidPayloadException);
      done();
    });
  });

  describe('PickedCardCommand', () => {
    test('should draw a card from the deck instead of from the player', (done) => {
      const testDeck = new Deck();
      const testCard = new Card(3);

      gameService.getCardService().save(testCard);

      testDeck.addCard(testCard);

      testLobby.setDeck(testDeck);

      expect(testPlayers[0].getHand().getCards().includes(testCard)).toBe(false);
      expect(testPlayers[0].getHand().getCards().includes(testCard)).toBe(false);
      expect(testDeck.getCards().includes(testCard)).toBe(true);

      const pickedCardCommand = new PickedCardCommand(gameService, io, serverSocket, {
        cardId: testCard.id,
        gameStateId: gameState.id,
        lobbyId: testLobby.id,
        playerNewId: testPlayers[0].id,
        playerPreviousId: testPlayers[1].id,
        fromOpponent: false,
      });

      pickedCardCommand.execute();

      expect(testPlayers[0].getHand().getCards().includes(testCard)).toBe(true);
      expect(testPlayers[1].getHand().getCards().includes(testCard)).toBe(false);
      expect(testDeck.getCards().includes(testCard)).toBe(false);
      done();
    });

    test('should throw DeckNotFoundException exception', (done) => {
      expect(() => {
        const card = new Card(0);
        gameService.getCardService().save(card);
        testPlayers[1].addToHand(card);

        testLobby.setDeck(undefined);

        const pickedCardCommand = new PickedCardCommand(gameService, io, serverSocket, {
          cardId: card.id,
          gameStateId: gameState.id,
          lobbyId: testLobby.id,
          playerNewId: testPlayers[0].id,
          playerPreviousId: testPlayers[1].id,
          fromOpponent: false,
        });

        pickedCardCommand.execute();
      }).toThrow(DeckNotFoundException);

      done();
    });

    test('should throw LobbyNotFoundException exception', (done) => {
      expect(() => {
        const pickedCardCommand = new PickedCardCommand(gameService, io, serverSocket, {
          cardId: testPlayers[0].getHand().getCards()[0].id,
          gameStateId: gameState.id,
          lobbyId: randomUUID(),
          playerNewId: testPlayers[0].id,
          playerPreviousId: testPlayers[1].id,
          fromOpponent: false,
        });

        pickedCardCommand.execute();
      }).toThrow(LobbyNotFoundException);
      done();
    });

    test('should throw CardNotFoundException exception', (done) => {
      expect(() => {
        const pickedCardCommand = new PickedCardCommand(gameService, io, serverSocket, {
          cardId: randomUUID(),
          gameStateId: gameState.id,
          lobbyId: testLobby.id,
          playerNewId: testPlayers[0].id,
          playerPreviousId: testPlayers[1].id,
          fromOpponent: false,
        });

        pickedCardCommand.execute();
      }).toThrow(CardNotFoundException);
      done();
    });

    test('should throw PlayerNotInLobbyException exception', (done) => {
      expect(() => {
        const player3 = new Player('Player3', new Hand(), randomUUID());
        gameService.getUserService().save(player3);

        const card = new Card(0);
        gameService.getCardService().save(card);

        player3.addToHand(card);

        const pickedCardCommand = new PickedCardCommand(gameService, io, serverSocket, {
          cardId: card.id,
          gameStateId: gameState.id,
          lobbyId: testLobby.id,
          playerNewId: player3.id,
          playerPreviousId: testPlayers[0].id,
          fromOpponent: false,
        });

        pickedCardCommand.execute();
      }).toThrow(PlayerNotInLobbyException);
      done();
    });

    test('player1 should take a card from player2s hand', (done) => {
      const card = new TwistedCard(0, SpecialEffect.SwitchLight);
      gameService.getCardService().save(card);

      testPlayers[0].addToHand(card);

      expect(testPlayers[0].getHand().getCards().includes(card)).toBe(true);
      expect(testPlayers[1].getHand().getCards().includes(card)).toBe(false);

      const pickedCardCommand = new PickedCardCommand(gameService, io, serverSocket, {
        cardId: card.id,
        gameStateId: gameState.id,
        lobbyId: testLobby.id,
        playerNewId: testPlayers[1].id,
        playerPreviousId: testPlayers[0].id,
        fromOpponent: true,
      });
      pickedCardCommand.execute();

      expect(testPlayers[0].getHand().getCards().includes(card)).toBe(false);
      expect(testPlayers[1].getHand().getCards().includes(card)).toBe(true);

      done();
    });

    test('should throw GameStateNotFoundException exception', (done) => {
      const card = new TwistedCard(0, SpecialEffect.SwitchLight);
      gameService.getCardService().save(card);

      expect(() => {
        const pickedCardCommand = new PickedCardCommand(gameService, io, serverSocket, {
          cardId: card.id,
          gameStateId: randomUUID(),
          lobbyId: randomUUID(),
          playerNewId: randomUUID(),
          playerPreviousId: randomUUID(),
          fromOpponent: false,
        });

        pickedCardCommand.execute();
      }).toThrow(GameStateNotFoundException);
      done();
    });

    test('should throw UserNotFoundException exception', (done) => {
      const card = new TwistedCard(0, SpecialEffect.SwitchLight);
      gameService.getCardService().save(card);

      expect(() => {
        const pickedCardCommand = new PickedCardCommand(gameService, io, serverSocket, {
          cardId: card.id,
          playerPreviousId: testPlayers[0].id,
          playerNewId: randomUUID(),
          gameStateId: gameState.id,
          lobbyId: testLobby.id,
          fromOpponent: false,
        });

        pickedCardCommand.execute();
      }).toThrow(UserNotFoundException);

      expect(() => {
        const pickedCardCommand = new PickedCardCommand(gameService, io, serverSocket, {
          cardId: card.id,
          playerPreviousId: randomUUID(),
          playerNewId: testPlayers[0].id,
          gameStateId: gameState.id,
          lobbyId: testLobby.id,
          fromOpponent: false,
        });

        pickedCardCommand.execute();
      }).toThrow(UserNotFoundException);

      done();
    });

    test('should throw CardNotInHandException exception', (done) => {
      expect(() => {
        const card = new TwistedCard(0, SpecialEffect.SwitchLight);
        gameService.getCardService().save(card);

        const pickedCardCommand = new PickedCardCommand(gameService, io, serverSocket, {
          cardId: card.id,
          playerPreviousId: testPlayers[0].id,
          playerNewId: testPlayers[1].id,
          gameStateId: gameState.id,
          lobbyId: testLobby.id,
          fromOpponent: true,
        });

        pickedCardCommand.execute();
      }).toThrow(CardNotInHandException);
      done();
    });

    test('should throw CardNotFoundException when providing non-existing cardId', (done) => {
      expect(() => {
        const pickedCardCommand = new PickedCardCommand(gameService, io, serverSocket, {
          cardId: randomUUID(),
          playerPreviousId: testPlayers[0].id,
          playerNewId: testPlayers[1].id,
          gameStateId: gameState.id,
          lobbyId: testLobby.id,
          fromOpponent: false,
        });

        pickedCardCommand.execute();
      }).toThrow(CardNotFoundException);
      done();
    });
  });

  describe('LeaveLobbyCommand', () => {
    test('should remove a Player from the lobby and then delete the lobby', (done) => {
      const mockSocket = {
        id: '1',
        leave: () => { },
        broadcast: {
          to: () => ({
            emit: () => { },
          }),
        },
      } as any;

      const player1 = testPlayers[0];
      const player2 = testPlayers[1];

      let leaveLobbyCommand = new LeaveLobbyCommand(gameService, io, mockSocket, {
        lobbyId: testLobby.id,
        playerId: player1.id,
      });

      leaveLobbyCommand.execute();

      expect(testLobby.getPlayers().includes(player1)).toBe(false);
      expect(gameService.getLobbyService().findById(testLobby.id)).toBeDefined();

      leaveLobbyCommand = new LeaveLobbyCommand(gameService, io, mockSocket, {
        lobbyId: testLobby.id,
        playerId: player2.id,
      });

      leaveLobbyCommand.execute();

      expect(testLobby.getPlayers().includes(player2)).toBe(false);
      expect(gameService.getLobbyService().findById(testLobby.id)).toBeUndefined();

      done();
    });

    test('should throw InvalidPayloadException when passing non UUID lobby id', (done) => {
      expect(() => {
        const leaveLobbyCommand = new LeaveLobbyCommand(gameService, io, serverSocket, {
          lobbyId: 'non-uuid-id' as UUID,
          playerId: randomUUID(),
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
          playerId: randomUUID(),
        });

        leaveLobbyCommand.execute();
      }).toThrow(UserNotFoundException);
    });

    test('should throw LobbyNotFoundException when attempting to leave non-existing lobby', (done) => {
      expect(() => {
        const leaveLobbyCommand = new LeaveLobbyCommand(gameService, io, serverSocket, {
          lobbyId: randomUUID(),
          playerId: testPlayers[0].id,
        });

        leaveLobbyCommand.execute();
      }).toThrow(LobbyNotFoundException);
      done();
    });
  });

  describe('UserConnectCommand', () => {
    test('should throw FailedUserConnectionException when user creation fails', () => {
      const userConnectCommand = new UserConnectCommand(gameService, io, serverSocket, {
        username: testPlayers[0].username,
      });

      expect(() => userConnectCommand.execute()).toThrow(FailedUserConnectionException);
    });

    test('should emit UserConnected event when valid payload is provided', (done) => {
      const userConnectCommand = new UserConnectCommand(gameService, io, serverSocket, {
        username: 'Player1',
      });

      clientSocket.on('UserConnected', (lobby) => {
        expect(lobby).toBeDefined();

        done();
      });

      userConnectCommand.execute();
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
    test('should throw UserNotFoundException exception', (done) => {
      expect(() => {
        const sendMessageCommand = new SendMessageCommand(gameService, io, serverSocket, {
          lobbyId: randomUUID(),
          message: '1234',
          playerId: randomUUID(),
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
          playerId: testPlayers[0].id,
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
          playerId: testPlayers[0].id,
        });

        sendMessageCommand.execute();
      }).toThrow(InvalidPayloadException);
      done();
    });
  });

  describe('CardDiscardedCommand', () => {
    test('should discard a card', (done) => {
      expect(gameState.table.getDisposedCards()).toHaveLength(0);

      const card = new Card(0);
      gameService.getCardService().save(card);

      testPlayers[0].addToHand(card);

      const cardDiscardedCommand = new CardDiscardedCommand(gameService, io, serverSocket, {
        cardId: card.id,
        gameStateId: gameState.id,
        lobbyId: testLobby.id,
        playerId: testPlayers[0].id,
      });

      cardDiscardedCommand.execute();

      expect(gameState.table.getDisposedCards()).toHaveLength(1);

      done();
    });

    test('should throw UserNotFoundException exception', (done) => {
      expect(() => {
        const cardDiscardedCommand = new CardDiscardedCommand(gameService, io, serverSocket, {
          cardId: randomUUID(),
          gameStateId: gameState.id,
          lobbyId: gameState.lobby!.id,
          playerId: randomUUID(),
        });

        cardDiscardedCommand.execute();
      }).toThrow(UserNotFoundException);
      done();
    });

    test('should throw NoPlayersInGameException exception', (done) => {
      testLobby.setPlayers([]);

      expect(() => {
        const cardDiscardedCommand = new CardDiscardedCommand(gameService, io, serverSocket, {
          cardId: randomUUID(),
          gameStateId: gameState.id,
          lobbyId: testLobby.id,
          playerId: randomUUID(),
        });

        cardDiscardedCommand.execute();
      }).toThrow(NoPlayersInGameException);
      done();
    });

    test('should throw CardNotInHandException exception', (done) => {
      const card = new Card(0);
      gameService.getCardService().save(card);

      expect(() => {
        const cardDiscardedCommand = new CardDiscardedCommand(gameService, io, serverSocket, {
          cardId: card.id,
          gameStateId: gameState.id,
          lobbyId: testLobby.id,
          playerId: testPlayers[0].id,
        });

        cardDiscardedCommand.execute();
      }).toThrow(CardNotInHandException);
      done();
    });

    test('should throw LobbyNotFoundException exception', (done) => {
      const card = new Card(0);
      gameService.getCardService().save(card);

      expect(() => {
        gameState.setLobby(undefined);
        const cardDiscardedCommand = new CardDiscardedCommand(gameService, io, serverSocket, {
          cardId: card.id,
          gameStateId: gameState.id,
          lobbyId: randomUUID(),
          playerId: testPlayers[0].id,
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
          playerId: randomUUID(),
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
          playerId: randomUUID(),
        });

        cardDiscardedCommand.execute();
      }).toThrow(InvalidPayloadException);
      done();
    });
  });

  describe('SaveGameStateCommand', () => {
    test('should save game state to file and emit GameStateSaved', async () => {
      const saveGameStateCommand = new SaveGameStateCommand(gameService, io, serverSocket, {
        gameState: new GameState(new Table()),
      });

      jest.spyOn(FileService, 'storeGameState').mockResolvedValueOnce(true);

      await saveGameStateCommand.execute();

      clientSocket.on('GameStateSaved', payload => {
        expect(FileService.storeGameState).toHaveBeenCalled();
        expect(payload).toBeDefined();
      });
    });
  });

  describe('RetrieveGameStateCommand', () => {
    test('should throw FailedToRetrieveGameStateException exceptio', async () => {
      const gameStateId = randomUUID();

      const retrieveGameStateCommand = new RetrieveGameStateCommand(gameService, io, serverSocket, {
        gameStateId,
        reconnectingPlayer: {
          id: randomUUID(),
          username: 'Player1',
        },
      });

      jest.spyOn(gameService, 'getGameState').mockReturnValueOnce(undefined);
      jest.spyOn(FileService, 'loadGameState').mockResolvedValueOnce({} as GameStateJson);

      await expect(retrieveGameStateCommand.execute()).rejects.toThrow(FailedToRetrieveGameStateException);
    });

    test('should retrieve game state if game state exists', async () => {
      gameService.setGameState(gameState);

      const retrieveGameStateCommand = new RetrieveGameStateCommand(gameService, io, serverSocket, {
        gameStateId: gameState.id,
        reconnectingPlayer: {
          id: testPlayers[0].id,
          username: 'Player1',
        },
      });

      await retrieveGameStateCommand.execute();

      clientSocket.on('GameStateRetrieved', payload => {
        expect(payload).toBeInstanceOf(GameState);
      });
    });

    test('should load game state from file and emit GameStateRetrieved', async () => {
      const playerId = randomUUID();
      const gameStateId = randomUUID();
      const gameStateJson: GameStateJson = {
        id: gameStateId,
        table: { id: randomUUID(), disposedCards: [] },
        currentPlayerIndex: 0,
        gameStatus: GameStatus.NotStarted,
        light: Lights.BLUE,
        lobby: {
          host: {
            id: 'id',
            isReady: false,
            username: 'test',
            hand: {
              cards: [],
            },
          },
          id: randomUUID(),
          lastActivityTime: Date.now(),
          messages: [],
          users: [
            {
              id: playerId,
              hand: {
                cards: [],
              },
              isReady: false,
              username: 'Player1',
            },
          ],
          deck: {
            id: randomUUID(),
            cards: [],
          },
        },
      };

      const retrieveGameStateCommand = new RetrieveGameStateCommand(gameService, io, serverSocket, {
        gameStateId: gameState.id,
        reconnectingPlayer: {
          id: playerId,
          username: 'Player1',
        },
      });

      jest.spyOn(gameService, 'getGameState').mockReturnValueOnce(undefined);
      jest.spyOn(FileService, 'loadGameState').mockResolvedValueOnce(gameStateJson);

      await retrieveGameStateCommand.execute();

      clientSocket.on('GameStateRetrieved', payload => {
        expect(payload).toBeDefined();
      });
    });
  });

  describe('UserDisconnectedCommand', () => {
    test('should remove user from lobby and lobby from lobby repository', (done) => {
      const player = new Player('Player1', new Hand(), randomUUID());
      gameService.getUserService().save(player);
      const lobby = new Lobby(player);
      gameService.getLobbyService().save(lobby);

      expect(gameService.getLobbyService().findById(lobby.id)).toBeDefined();

      const userDisconnectCommand = new UserDisconnectCommand(gameService, io, serverSocket, {
        playerId: player.id,
        gameStateId: gameState.id,
        lobbyId: lobby.id,
      });

      userDisconnectCommand.execute();

      expect(gameService.getLobbyService().findById(lobby.id)).toBeUndefined();

      done();
    });

    test('should throw UserNotFoundException exception', (done) => {
      expect(() => {
        const userDisconnectCommand = new UserDisconnectCommand(gameService, io, serverSocket, {
          playerId: randomUUID(),
          gameStateId: randomUUID(),
          lobbyId: randomUUID(),
        });

        userDisconnectCommand.execute();
      }).toThrow(UserNotFoundException);
      done();
    });

    test('should throw InvalidPayloadException exception', (done) => {
      expect(() => {
        const userDisconnectCommand = new UserDisconnectCommand(gameService, io, serverSocket, {
          playerId: randomUUID(),
          gameStateId: 'non-uuid' as UUID,
          lobbyId: randomUUID(),
        });

        userDisconnectCommand.execute();
      }).toThrow(InvalidPayloadException);
      done();
    });
  });

  describe('GameOverCommand', () => {
    test('should end the game', (done) => {
      expect(gameState.gameStatus).toBe('in_progress');

      testPlayers[0].setHand(new Hand());

      const gameOverCommand = new GameOverCommand(gameService, io, serverSocket, {
        lobbyId: testLobby.id,
        gameStateId: gameState.id,
      });

      gameOverCommand.execute();

      expect(gameState.gameStatus).toBe('ended');

      done();
    });

    test('should throw GameHasNotEndedException exception', (done) => {
      const player = new Player('Player1', new Hand(), randomUUID());
      player.addToHand(new Card(0));

      const lobby = new Lobby(player);
      lobby.addUser(player);

      gameService.getLobbyService().save(lobby);

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
      const player = new Player('Player1', new Hand(), randomUUID());
      const lobby = new Lobby(player);

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
          playerId: randomUUID(),
          lobbyId: testLobby.id,
        });
        userReadyCommand.execute();
      }).toThrow(UserNotFoundException);
      done();
    });

    test('should throw LobbyNotFoundException exception', (done) => {
      const testPlayer = new Player('Player1', new Hand(), randomUUID());
      gameService.getUserService().save(testPlayer);
      expect(() => {
        const userReadyCommand = new UserReadyCommand(gameService, io, serverSocket, {
          playerId: testPlayer.id,
          lobbyId: randomUUID(),
        });
        userReadyCommand.execute();
      }).toThrow(LobbyNotFoundException);
      done();
    });
  });

  describe('PingCommand', () => {
    test('should emit pong', (done) => {
      const pingCommand = new PingCommand(gameService, io, serverSocket, {});
      const mockPingCommand = jest.spyOn(pingCommand, 'execute');

      pingCommand.execute();

      expect(mockPingCommand).toHaveBeenCalled();
      done();
    });
  });
});
