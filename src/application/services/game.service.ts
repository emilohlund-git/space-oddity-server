import GameState from '../../domain/entities/GameState';
import { CardService } from '../services/card.service';
import { TableService } from '../services/table.service';
import { UserService } from '../services/user.service';
import { DeckService } from './deck.service';
import { LobbyService } from './lobby.service';

class GameService {
  private readonly userService: UserService;

  private readonly cardService: CardService;

  private readonly tableService: TableService;

  private readonly deckService: DeckService;

  private readonly lobbyService: LobbyService;

  private readonly gameState: GameState;

  constructor(
    userService: UserService,
    cardService: CardService,
    tableService: TableService,
    deckService: DeckService,
    lobbyService: LobbyService,
    gameState: GameState,
  ) {
    this.userService = userService;
    this.cardService = cardService;
    this.tableService = tableService;
    this.deckService = deckService;
    this.lobbyService = lobbyService;
    this.gameState = gameState;
  }

  // Add methods for coordinating operations and accessing services as needed
  // For example:
  public getUserService(): UserService {
    return this.userService;
  }

  public getCardService(): CardService {
    return this.cardService;
  }

  public getTableService(): TableService {
    return this.tableService;
  }

  public getDeckService(): DeckService {
    return this.deckService;
  }

  public getLobbyService(): LobbyService {
    return this.lobbyService;
  }

  public getGameState(): GameState {
    return this.gameState;
  }
}

export default GameService;