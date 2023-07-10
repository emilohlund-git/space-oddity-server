import { CardService } from '../../../src/application/services/card.service';
import { DeckService } from '../../../src/application/services/deck.service';
import GameService from '../../../src/application/services/game.service';
import { LobbyService } from '../../../src/application/services/lobby.service';
import { TableService } from '../../../src/application/services/table.service';
import { UserService } from '../../../src/application/services/user.service';
import GameState from '../../../src/domain/entities/GameState';
import { Lobby } from '../../../src/domain/entities/Lobby';
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
    gameState.setLobby(new Lobby());
    gameService = new GameService(
      userService,
      cardService,
      tableService,
      deckService,
      lobbyService,
      gameState,
    );
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
});