import GameNotInProgressException from '../../application/exceptions/game-not-in-progress.exception';
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
  RED,
  BLUE,
}

class GameState {
  public table: Table;

  public currentPlayerIndex: number;

  public gameStatus: GameStatus;

  public light: Lights;

  public lobby: Lobby;

  constructor(lobby: Lobby, table: Table) {
    this.lobby = lobby;
    this.table = table;
    this.currentPlayerIndex = 0;
    this.gameStatus = GameStatus.NotStarted;
    this.light = Lights.RED;
  }

  public startGame(): void {
    // Distribute initial cards to players
    this.lobby.getDeck().distributeCardsToPlayers(this.lobby.getPlayers());

    // Find the player with the least amount of cards
    const players = this.lobby.getPlayers();
    const playerWithLeastCards = players.reduce((prevPlayer, currentPlayer) => {
      return currentPlayer.getHand().getCards().length < prevPlayer.getHand().getCards().length ? currentPlayer : prevPlayer;
    });

    // Set the currentPlayerIndex to the index of the player with the least amount of cards
    this.currentPlayerIndex = players.findIndex((player) => player === playerWithLeastCards);

    this.gameStatus = GameStatus.InProgress;
  }

  public nextTurn(): void {
    if (this.gameStatus !== GameStatus.InProgress) {
      throw new Error('Game is not in progress');
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
    return this.lobby.getPlayers()[this.currentPlayerIndex];
  }

  public isGameOver(): boolean {
    // Game over condition: Any player has an empty hand
    return this.lobby.getPlayers().some((player) => player.getHand().getCards().length === 0);
  }

  public endGame(): void {
    this.gameStatus = GameStatus.Ended;
  }
}

export default GameState;