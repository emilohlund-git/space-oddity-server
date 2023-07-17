import { randomUUID } from 'crypto';
import LobbyNotFoundException from '../../../src/application/exceptions/lobby-not-found.exception';
import { CardService } from '../../../src/application/services/card.service';
import { DeckService } from '../../../src/application/services/deck.service';
import { GameStateJson } from '../../../src/application/services/file.service';
import GameService from '../../../src/application/services/game.service';
import { LobbyService } from '../../../src/application/services/lobby.service';
import { TableService } from '../../../src/application/services/table.service';
import { UserService } from '../../../src/application/services/user.service';
import Card, { CardType } from '../../../src/domain/entities/Card';
import Deck from '../../../src/domain/entities/Deck';
import GameState, { GameStatus, Lights } from '../../../src/domain/entities/GameState';
import { Lobby } from '../../../src/domain/entities/Lobby';
import Player from '../../../src/domain/entities/Player';
import Table from '../../../src/domain/entities/Table';
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

describe('GameService', () => {
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

  beforeEach(() => {
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
    gameState.setLobby(new Lobby(new Player('1234', 'test')));
    gameService = new GameService(
      userService,
      cardService,
      tableService,
      deckService,
      lobbyService,
    );
    gameService.setGameState(gameState);
  });

  describe('getTableService', () => {
    it('should return the TableService instance inside of GameService', () => {
      const tService = gameService.getTableService();

      expect(tService).toBeDefined();
    });
  });

  describe('getDeckService', () => {
    it('should return the DeckService instance inside of GameService', () => {
      const dService = gameService.getDeckService();

      expect(dService).toBeDefined();
    });
  });

  describe('createFromLoadedJson', () => {
    it('should throw LobbyNotFoundException exception', () => {
      const gameStateJson: GameStateJson = {
        id: randomUUID(),
        table: {
          id: randomUUID(),
          disposedCards: [],
        },
        currentPlayerIndex: 0,
        gameStatus: GameStatus.InProgress,
        light: Lights.BLUE,
      };

      expect(() => {
        gameService.createFromLoadedJson(gameStateJson);
      }).toThrow(LobbyNotFoundException);
    });

    it('should create game entities from loaded JSON and set them in respective services', () => {
      const gameStateJsonId = randomUUID();

      const gameStateJson: GameStateJson = {
        id: gameStateJsonId,
        table: {
          id: randomUUID(),
          disposedCards: [],
        },
        currentPlayerIndex: 0,
        gameStatus: GameStatus.InProgress,
        light: Lights.BLUE,
        lobby: {
          id: randomUUID(),
          lastActivityTime: 1234567890,
          users: [
            {
              id: 'user-1',
              username: 'user1',
              hand: {
                cards: [],
              },
              isReady: true,
            },
            {
              id: 'user-2',
              username: 'user2',
              hand: {
                cards: [],
              },
              isReady: false,
            },
          ],
          messages: [],
          deck: {
            id: randomUUID(),
            cards: [
              {
                id: randomUUID(),
                type: CardType.Regular,
                value: 1,
                graphic: 'card1.png',
              },
              {
                id: randomUUID(),
                type: CardType.Regular,
                value: 5,
                graphic: 'card5.png',
              },
            ],
          },
          host: {
            id: 'host-id',
            username: 'host',
            hand: {
              cards: [],
            },
            isReady: true,
          },
        },
      };

      const mockSaveManyUsers = jest.spyOn(gameService.getUserService(), 'saveMany');
      const mockSaveManyCards = jest.spyOn(gameService.getCardService(), 'saveMany');
      const mockSaveTable = jest.spyOn(gameService.getTableService(), 'save');
      const mockSaveDeck = jest.spyOn(gameService.getDeckService(), 'save');
      const mockSaveLobby = jest.spyOn(gameService.getLobbyService(), 'save');

      const rescuedGameState = gameService.createFromLoadedJson(gameStateJson);

      expect(rescuedGameState).toBeInstanceOf(GameState);
      expect(rescuedGameState.id).toBe(gameStateJsonId);

      expect(mockSaveManyUsers).toHaveBeenCalledWith([
        expect.any(Player),
        expect.any(Player),
      ]);

      expect(mockSaveManyCards).toHaveBeenCalledWith([
        expect.any(Card),
        expect.any(Card),
      ]);

      expect(mockSaveTable).toHaveBeenCalledWith(expect.any(Table));
      expect(mockSaveDeck).toHaveBeenCalledWith(expect.any(Deck));
      expect(mockSaveLobby).toHaveBeenCalledWith(expect.any(Lobby));
    });
  });
});