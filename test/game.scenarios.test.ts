import { randomUUID } from 'crypto';
import { createServer } from 'http';
import { Server, Socket as ServerSocket } from 'socket.io';
import Client, { Socket as ClientSocket } from 'socket.io-client';
import GameNotInProgressException from '../src/application/exceptions/game-not-in-progress.exception';
import { CardService } from '../src/application/services/card.service';
import { DeckService } from '../src/application/services/deck.service';
import GameService from '../src/application/services/game.service';
import { LobbyService } from '../src/application/services/lobby.service';
import { TableService } from '../src/application/services/table.service';
import { UserService } from '../src/application/services/user.service';
import GameState from '../src/domain/entities/GameState';
import Hand from '../src/domain/entities/Hand';
import { Lobby } from '../src/domain/entities/Lobby';
import Player from '../src/domain/entities/Player';
import Table from '../src/domain/entities/Table';
import { CardRepository } from '../src/domain/repositories/card-repository.interface';
import { DeckRepository } from '../src/domain/repositories/deck-repository.interface';
import { LobbyRepository } from '../src/domain/repositories/lobby-repository.interface';
import { TableRepository } from '../src/domain/repositories/table-repository.interface';
import { UserRepository } from '../src/domain/repositories/user-repository.interface';
import { InMemoryCardRepository } from '../src/infrastructure/repositories/in-memory-card.repository';
import { InMemoryDeckRepository } from '../src/infrastructure/repositories/in-memory-deck.repository';
import { InMemoryLobbyRepository } from '../src/infrastructure/repositories/in-memory-lobby.repository';
import { InMemoryTableRepository } from '../src/infrastructure/repositories/in-memory-table.repository';
import { InMemoryUserRepository } from '../src/infrastructure/repositories/in-memory-user.repository';
import { getShuffledDeck } from './utils/test.utils';

describe('GameScenarios', () => {
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
      new Lobby(randomUUID(), getShuffledDeck()),
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
    const port = 4000;
    httpServer.listen(port, () => {
      /* @ts-ignore */
      clientSocket = new Client(`http://localhost:${port}`);
      io.on('connection', (socket) => {
        serverSocket = socket;
        serverSocket.emit('hola');
      });
      clientSocket.on('connect', done);
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.close();
  });

  describe('Start game', () => {
    let player1: Player;
    let player2: Player;
    let player3: Player;

    beforeAll(() => {
      player1 = new Player('1', 'player1');
      player2 = new Player('2', 'player2');
      player3 = new Player('3', 'player3');
      gameService.getUserService().save(player1);
      gameService.getUserService().save(player2);
      gameService.getUserService().save(player3);

      gameService.getGameState().lobby.addUser(player1);
      gameService.getGameState().lobby.addUser(player2);
      gameService.getGameState().lobby.addUser(player3);

      gameState.startGame();
    });

    it('should distribute cards to players', () => {
      expect(player1.getHand().getCards().length).toBeGreaterThanOrEqual(gameState.lobby.getDeck().getCards().length / gameState.lobby.getPlayers().length);
      expect(player2.getHand().getCards().length).toBeGreaterThanOrEqual(gameState.lobby.getDeck().getCards().length / gameState.lobby.getPlayers().length);
      expect(player3.getHand().getCards().length).toBeGreaterThanOrEqual(gameState.lobby.getDeck().getCards().length / gameState.lobby.getPlayers().length);
    });

    it('should be player3 who starts, and then change turn to player1, then player2...', () => {
      const players = gameState.lobby.getPlayers();
      expect(gameState.getCurrentPlayer().getUserName()).toBe(players[2].getUserName());

      for (let i = 0; i < players.length; i++) {
        gameState.nextTurn();
        expect(gameState.getCurrentPlayer().getUserName()).toBe(players[i].getUserName());
      }
    });

    it('should throw GameNotInProgressException exception', () => {
      expect(() => {
        gameState.endGame();
        const players = gameState.lobby.getPlayers();
        const cardToTransfer = players[0].getHand().getCards()[0];
        gameService.getGameState().transferCard(players[0], players[1], cardToTransfer);
      }).toThrow(GameNotInProgressException);
    });

    it('should throw GameNotInProgressException exception', () => {
      expect(() => {
        gameState.endGame();
        gameState.nextTurn();
      }).toThrow(GameNotInProgressException);
    });

    it('should take a card from the next player', () => {
      gameState.startGame();

      const players = gameState.lobby.getPlayers();
      const cardToTransfer = players[0].getHand().getCards()[0];

      // Ensure the card exists in player1's hand before transfer
      let cardExists = players[0].getHand().getCards().some((card) => card.id === cardToTransfer.id);
      expect(cardExists).toBe(true);

      gameService.getGameState().transferCard(players[0], players[1], cardToTransfer);

      // Ensure the card is removed from player1's hand after transfer
      cardExists = players[0].getHand().getCards().some((card) => card.id === cardToTransfer.id);
      expect(cardExists).toBe(false);

      // Ensure the card is added to player2's hand after transfer
      cardExists = players[1].getHand().getCards().some((card) => card.id === cardToTransfer.id);
      expect(cardExists).toBe(true);
    });

    it('should end the game and return true', () => {
      const winningPlayer = gameState.lobby.getPlayers()[0];

      winningPlayer.setHand(new Hand());

      expect(gameState.isGameOver()).toBe(true);
    });
  });
});

