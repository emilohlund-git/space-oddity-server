import { UUID, randomUUID } from 'crypto';
import DeckNotFoundException from '../../application/exceptions/deck-not-found.exception';
import GameNotInProgressException from '../../application/exceptions/game-not-in-progress.exception';
import LobbyNotFoundException from '../../application/exceptions/lobby-not-found.exception';
import Card from './Card';
import { Lobby } from './Lobby';
import Player from './Player';
import Table from './Table';

enum GameStatus {
  NotStarted = 'not_started',
  InProgress = 'in_progress',
  Ended = 'ended',
}

export enum Lights {
  RED = 'red',
  BLUE = 'blue',
}

class GameState {
  public id: UUID = randomUUID();

  public table: Table;

  public currentPlayerIndex: number;

  public gameStatus: GameStatus;

  public light: Lights;

  public lobby: Lobby | undefined;

  constructor(table: Table) {
    this.table = table;
    this.currentPlayerIndex = 0;
    this.gameStatus = GameStatus.NotStarted;
    this.light = Lights.RED;
  }

  public startGame(): void {
    if (!this.lobby) throw new LobbyNotFoundException('Lobby doesn\'t exist for GameState');

    const deck = this.lobby.getDeck();

    if (!deck) throw new DeckNotFoundException('Lobby doesn\'t contain a deck');

    // Distribute initial cards to players
    deck.distributeCardsToPlayers(this.lobby.getPlayers());

    // Find the player with the least amount of cards
    const players = this.lobby.getPlayers();

    let playerWithLeastCards = players[0];
    for (const player of players) {
      if (player.getHand().getCards().length <
        playerWithLeastCards.getHand().getCards().length) {
        playerWithLeastCards = player;
      }
    }

    // Set the currentPlayerIndex to the index of the player with the least amount of cards
    this.currentPlayerIndex = players.findIndex((player) => player === playerWithLeastCards);

    this.gameStatus = GameStatus.InProgress;
  }

  public nextTurn(): void {
    if (this.gameStatus !== GameStatus.InProgress) {
      throw new GameNotInProgressException('Game is not in progress');
    }

    if (!this.lobby) {
      throw new LobbyNotFoundException('Lobby does not exist for GameState');
    }

    // Move to the next player's turn
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.lobby.getPlayers().length;
  }

  public transferCard(sourcePlayer: Player, targetPlayer: Player, card: Card): void {
    if (this.gameStatus !== GameStatus.InProgress) {
      throw new GameNotInProgressException('Game is not in progress');
    }

    const sourceHand = sourcePlayer.getHand();
    const targetHand = targetPlayer.getHand();

    sourceHand.removeCard(card);
    card.setOwner(targetPlayer);
    targetHand.addCard(card);
  }

  public getCurrentPlayer(): Player {
    if (!this.lobby) {
      throw new LobbyNotFoundException('Lobby does not exist for GameState');
    }

    return this.lobby.getPlayers()[this.currentPlayerIndex];
  }

  public isGameOver(): boolean {
    if (!this.lobby) {
      throw new LobbyNotFoundException('Lobby does not exist for GameState');
    }

    // Game over condition: Any player has an empty hand
    return this.lobby.getPlayers().some((player) => player.getHand().getCards().length === 0);
  }

  public endGame(): void {
    this.gameStatus = GameStatus.Ended;
  }

  public getLobby(): Lobby | undefined {
    return this.lobby;
  }

  public setLobby(lobby: Lobby): void {
    this.lobby = lobby;
  }
}

export default GameState;