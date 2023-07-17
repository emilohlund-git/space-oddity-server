import { UUID } from 'crypto';
import Card from '../../domain/entities/Card';
import Deck from '../../domain/entities/Deck';
import GameState from '../../domain/entities/GameState';
import { Lobby } from '../../domain/entities/Lobby';
import Player from '../../domain/entities/Player';
import Table from '../../domain/entities/Table';
import LobbyNotFoundException from '../exceptions/lobby-not-found.exception';
import { CardService } from '../services/card.service';
import { TableService } from '../services/table.service';
import { UserService } from '../services/user.service';
import { mapJsonToClass } from '../utils/json-mapper';
import { DeckService } from './deck.service';
import { CardJson, DeckJson, GameStateJson, LobbyJson, PlayerJson, TableJson } from './file.service';
import { LobbyService } from './lobby.service';

class GameService {
  private readonly userService: UserService;

  private readonly cardService: CardService;

  private readonly tableService: TableService;

  private readonly deckService: DeckService;

  private readonly lobbyService: LobbyService;

  private readonly gameStates: Map<string, GameState> = new Map();

  constructor(
    userService: UserService,
    cardService: CardService,
    tableService: TableService,
    deckService: DeckService,
    lobbyService: LobbyService,
  ) {
    this.userService = userService;
    this.cardService = cardService;
    this.tableService = tableService;
    this.deckService = deckService;
    this.lobbyService = lobbyService;
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

  public getGameState(gameStateId: UUID): GameState | undefined {
    return this.gameStates.get(gameStateId);
  }

  public getGameStates(): GameState[] {
    return Array.from(this.gameStates.values());
  }

  public setGameState(gameState: GameState): void {
    this.gameStates.set(gameState.id, gameState);
  }

  public removeGameState(gameStateId: UUID): void {
    this.gameStates.delete(gameStateId);
  }

  public createFromLoadedJson(json: GameStateJson): GameState {
    // Parse the loaded JSON and create entities
    const gameState = GameService.parseGameState(json);

    if (!json.lobby) throw new LobbyNotFoundException();

    const userEntities = GameService.parseUserEntities(json.lobby.users);
    const cardEntities = GameService.parseCardEntities(json.lobby.deck!.cards);
    const tableEntity = GameService.parseTableEntity(json.table);
    const deckEntity = GameService.parseDeckEntity(json.lobby.deck!);
    const lobbyEntity = GameService.parseLobbyEntity(json.lobby);

    // Set the created entities in their respective services
    this.userService.saveMany(userEntities);
    this.cardService.saveMany(cardEntities);
    this.tableService.save(tableEntity);
    this.deckService.save(deckEntity);
    this.lobbyService.save(lobbyEntity);

    // Set the parsed gameState in gameStates map
    gameState.setLobby(lobbyEntity);
    this.setGameState(gameState);

    return gameState;
  }

  private static parseGameState(json: GameStateJson): GameState {
    const gameState = mapJsonToClass(json, GameState);

    return gameState;
  }

  private static parseUserEntities(json: PlayerJson[]): Player[] {
    const players = <Player[]>[];

    for (const j of json) {
      const player = mapJsonToClass(j, Player);
      players.push(player);
    }

    return players;
  }

  private static parseCardEntities(json: CardJson[]): Card[] {
    const cards = <Card[]>[];

    for (const c of json) {
      const card = mapJsonToClass(c, Card);
      cards.push(card);
    }

    return cards;
  }

  private static parseTableEntity(json: TableJson): Table {
    const table = mapJsonToClass(json, Table);

    return table;
  }

  private static parseDeckEntity(json: DeckJson): Deck {
    const deck = mapJsonToClass(json, Deck);

    return deck;
  }

  private static parseLobbyEntity(json: LobbyJson): Lobby {
    const lobby = mapJsonToClass(json, Lobby);

    return lobby;
  }
}

export default GameService;