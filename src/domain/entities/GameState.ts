import Deck from './Deck';
import Player from './Player';
import Table from './Table';

enum GameStatus {
  NotStarted = 'not_started',
  InProgress = 'in_progress',
  Ended = 'ended',
}

class GameState {
  public players: Player[];

  public table: Table;

  public deck: Deck;

  public currentPlayerIndex: number;

  public gameStatus: GameStatus;

  constructor(players: Player[], table: Table, deck: Deck) {
    this.players = players;
    this.table = table;
    this.deck = deck;
    this.currentPlayerIndex = 0;
    this.gameStatus = GameStatus.NotStarted;
  }

  public startGame(): void {
    // Distribute initial cards to players
    this.players.forEach((player) => {
      const initialCards = this.deck.drawCards(5);
      player.getHand().addCards(initialCards);
    });

    this.gameStatus = GameStatus.InProgress;
  }

  public nextTurn(): void {
    if (this.gameStatus !== GameStatus.InProgress) {
      throw new Error('Game is not in progress');
    }

    // Move to the next player's turn
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
  }

  public getCurrentPlayer(): Player {
    return this.players[this.currentPlayerIndex];
  }

  public isGameOver(): boolean {
    // Game over condition: Any player has an empty hand
    return this.players.some((player) => player.getHand().getCards().length === 0);
  }

  public endGame(): void {
    this.gameStatus = GameStatus.Ended;
  }
}

export default GameState;