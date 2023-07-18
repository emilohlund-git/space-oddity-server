import { randomUUID } from 'crypto';
import { CardService } from '../../src/application/services/card.service';
import { DeckService } from '../../src/application/services/deck.service';
import GameService from '../../src/application/services/game.service';
import { LobbyService } from '../../src/application/services/lobby.service';
import { TableService } from '../../src/application/services/table.service';
import { UserService } from '../../src/application/services/user.service';
import { getShuffledDeck } from '../../src/application/utils/deck.utils';
import GameState from '../../src/domain/entities/GameState';
import Hand from '../../src/domain/entities/Hand';
import { Lobby } from '../../src/domain/entities/Lobby';
import Player from '../../src/domain/entities/Player';
import Table from '../../src/domain/entities/Table';
import { InMemoryCardRepository } from '../../src/infrastructure/repositories/in-memory-card.repository';
import { InMemoryDeckRepository } from '../../src/infrastructure/repositories/in-memory-deck.repository';
import { InMemoryLobbyRepository } from '../../src/infrastructure/repositories/in-memory-lobby.repository';
import { InMemoryTableRepository } from '../../src/infrastructure/repositories/in-memory-table.repository';
import { InMemoryUserRepository } from '../../src/infrastructure/repositories/in-memory-user.repository';

type MockGameResponse = {
  mockedGameService: GameService;
  mockedGameState: GameState;
  mockedLobby: Lobby;
};

export const mockGameService = (): MockGameResponse => {
  const cardRepository = new InMemoryCardRepository();
  const userRepository = new InMemoryUserRepository();
  const lobbyRepository = new InMemoryLobbyRepository();
  const tableRepository = new InMemoryTableRepository();
  const deckRepository = new InMemoryDeckRepository();
  const cardService = new CardService(cardRepository);
  const userService = new UserService(userRepository);
  const lobbyService = new LobbyService(lobbyRepository);
  const tableService = new TableService(tableRepository);
  const deckService = new DeckService(deckRepository);
  const table = new Table();
  tableService.save(table);
  const mockedGameState = new GameState(table);
  const player1 = new Player('TestPlayer', new Hand(), randomUUID());
  const player2 = new Player('TestPlayer2', new Hand(), randomUUID());
  const deck = getShuffledDeck();
  const mockedLobby = new Lobby(player1);
  mockedLobby.addUser(player2);
  mockedLobby.setDeck(deck);
  lobbyService.save(mockedLobby);
  userService.saveMany([player1, player2]);
  cardService.saveMany(deck.getCards());
  mockedGameState.setLobby(mockedLobby);
  const mockedGameService = new GameService(
    userService,
    cardService,
    tableService,
    deckService,
    lobbyService,
  );

  mockedGameService.setGameState(mockedGameState);

  mockedGameState.startGame();

  return { mockedLobby, mockedGameState, mockedGameService };
};