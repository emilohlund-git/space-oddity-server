import { randomUUID } from 'crypto';
import GameManager from '../../src/application/game.manager';
import { CardService } from '../../src/application/services/card.service';
import { DeckService } from '../../src/application/services/deck.service';
import GameService from '../../src/application/services/game.service';
import { LobbyService } from '../../src/application/services/lobby.service';
import { TableService } from '../../src/application/services/table.service';
import { UserService } from '../../src/application/services/user.service';
import { FIVE_MIN_IN_MS, FOUR_MIN_IN_MS } from '../../src/application/utils/constants';
import Card from '../../src/domain/entities/Card';
import Deck from '../../src/domain/entities/Deck';
import GameState from '../../src/domain/entities/GameState';
import Hand from '../../src/domain/entities/Hand';
import { Lobby } from '../../src/domain/entities/Lobby';
import Player from '../../src/domain/entities/Player';
import Table from '../../src/domain/entities/Table';
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

describe('GameManager', () => {
  let gameManager: GameManager;
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
  let lobby: Lobby;
  let player: Player;
  let deck: Deck;
  let card: Card;

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
    card = new Card(0);
    cardService.save(card);
    deck = new Deck();
    deck.addCard(card);
    deckService.save(deck);
    player = new Player('Player1', new Hand(), randomUUID());
    userService.save(player);
    lobby = new Lobby(player);
    lobby.setDeck(deck);
    lobbyService.save(lobby);
    gameState.setLobby(lobby);
    gameService = new GameService(
      userService,
      cardService,
      tableService,
      deckService,
      lobbyService,
    );

    gameService.setGameState(gameState);

    gameManager = new GameManager(gameService);
  });

  describe('updateActivityTime', () => {
    test('should update a lobby\'s latest activity time', (done) => {
      const latestActivityTime = lobby.lastActivityTime;

      setTimeout(() => {
        gameManager.updateActivityTime(lobby.id);
        const updatedLobby = gameManager.getGameService().getLobbyService().findById(lobby.id);
        expect(updatedLobby?.lastActivityTime).toBeGreaterThan(latestActivityTime);
        done();
      }, 10);
    });
  });

  describe('checkInactiveLobbies', () => {
    test('should not remove lobbies and associated resources', () => {
      lobby.lastActivityTime = Date.now() - FOUR_MIN_IN_MS;

      gameManager.checkInactiveLobbies();

      const existingLobby = gameManager.getGameService().getLobbyService().findById(lobby.id);
      expect(existingLobby).toBeDefined();

      const existingUser = gameManager.getGameService().getUserService().findById(player.id);
      expect(existingUser).toBeDefined();

      const existingDeck = gameManager.getGameService().getDeckService().findById(deck.id);
      expect(existingDeck).toBeDefined();

      const existingCard = gameManager.getGameService().getCardService().findById(card.id);
      expect(existingCard).toBeDefined();
    });

    test('should remove inactive lobbies and associated resources', () => {
      lobby.lastActivityTime = Date.now() - FIVE_MIN_IN_MS;

      gameManager.checkInactiveLobbies();

      const removedLobby = gameManager.getGameService().getLobbyService().findById(lobby.id);
      expect(removedLobby).toBeUndefined();

      const removedUser = gameManager.getGameService().getUserService().findById(player.id);
      expect(removedUser).toBeUndefined();

      const removedDeck = gameManager.getGameService().getDeckService().findById(deck.id);
      expect(removedDeck).toBeUndefined();

      const removedCard = gameManager.getGameService().getCardService().findById(card.id);
      expect(removedCard).toBeUndefined();
    });
  });
});