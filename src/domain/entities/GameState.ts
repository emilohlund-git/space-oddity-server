import { UUID, randomUUID } from 'crypto';
import CardNotInHandException from '../../application/exceptions/card-not-in-hand.exception';
import DeckNotFoundException from '../../application/exceptions/deck-not-found.exception';
import GameNotInProgressException from '../../application/exceptions/game-not-in-progress.exception';
import LobbyNotFoundException from '../../application/exceptions/lobby-not-found.exception';
import NoPlayersInGameException from '../../application/exceptions/no-players-in-game.exception';
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

  public lobby?: Lobby;

  constructor(table: Table) {
    this.table = table;
    this.currentPlayerIndex = 0;
    this.gameStatus = GameStatus.NotStarted;
    this.light = Lights.BLUE;
  }

  public startGame(): void {
    if (!this.lobby) throw new LobbyNotFoundException('Lobby doesn\'t exist for GameState');

    const deck = this.lobby.getDeck();

    if (!deck) throw new DeckNotFoundException('Lobby doesn\'t contain a deck');

    // Distribute initial cards to players
    deck.distributeCardsToPlayers(this.lobby.getPlayers());

    // Find the player with the least amount of cards
    let playerWithLeastCards = this.getPlayerWithLeastAmountOfCards();

    // Set the currentPlayerIndex to the index of the player with the least amount of cards
    this.currentPlayerIndex = this.lobby.getPlayers().findIndex((player) => player === playerWithLeastCards);

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

  public matchCards(player: Player, card1: Card, card2: Card): void {
    const hand = player.getHand();
    const cards = hand.getCards();

    if (!cards.includes(card1) || !cards.includes(card2)) {
      throw new CardNotInHandException();
    }

    if (card1.getValue() === card2.getValue()) {
      hand.removeCards([card1, card2]);
    }
  }

  public transferCard(sourcePlayer: Player, targetPlayer: Player, card: Card): void {
    if (this.gameStatus !== GameStatus.InProgress) {
      throw new GameNotInProgressException('Game is not in progress');
    }

    const sourceHand = sourcePlayer.getHand();
    const targetHand = targetPlayer.getHand();

    sourceHand.removeCard(card);
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

  public setLobby(lobby: Lobby | undefined): void {
    this.lobby = lobby;
  }

  public getPlayerWithLeastAmountOfCards(): Player {
    if (!this.lobby) {
      throw new LobbyNotFoundException('Lobby does not exist for GameState');
    }

    let playerWithLeastAmountOfCards = this.lobby.getPlayers()[0];
    const players = this.lobby.getPlayers();

    if (players.length < 1) {
      throw new NoPlayersInGameException();
    }

    for (const player of players) {
      if (playerWithLeastAmountOfCards.getHand().getCards().length >
        player.getHand().getCards().length) {
        playerWithLeastAmountOfCards = player;
      }
    }

    return playerWithLeastAmountOfCards;
  }
}

export default GameState;