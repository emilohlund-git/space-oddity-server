import { UUID, randomUUID } from 'crypto';
import InsufficientCardsException from '../../application/exceptions/insufficient-cards.exception';
import Card from './Card';
import Player from './Player';

class Deck {
  public id: UUID = randomUUID();

  private cards: Card[];

  constructor() {
    this.cards = [];
  }

  public getCards(): Card[] {
    return this.cards;
  }

  public setCards(cards: Card[]): void {
    this.cards = cards;
  }

  public drawCard(): Card | undefined {
    return this.cards.shift();
  }

  public drawCards(count: number): Card[] {
    if (count > this.cards.length) {
      throw new InsufficientCardsException();
    }

    const drawnCards = this.cards.splice(0, count);
    return drawnCards;
  }

  distributeCardsToPlayers(players: Player[]) {
    const numPlayers = players.length;
    const distributedCards = [];

    let cardsRemaining = this.cards.length; // Track the number of cards remaining to distribute
    let currentPlayerIndex = 0; // Track the current player index

    while (cardsRemaining > 0) {
      const player = players[currentPlayerIndex];
      const card = this.drawCard();

      if (card) {
        player.addToHand(card);
        distributedCards.push(card);
        cardsRemaining--; // Decrease the count of remaining cards
      }

      currentPlayerIndex = (currentPlayerIndex + 1) % numPlayers; // Move to the next player in a round-robin fashion
    }

    return distributedCards;
  }

  public shuffle(): void {
    let currentIndex = this.cards.length;
    let temporaryValue: Card;
    let randomIndex: number;

    // While there remain elements to shuffle
    while (currentIndex !== 0) {
      // Pick a remaining element
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // Swap it with the current element
      temporaryValue = this.cards[currentIndex];
      this.cards[currentIndex] = this.cards[randomIndex];
      this.cards[randomIndex] = temporaryValue;
    }
  }

  public isEmpty(): boolean {
    return this.cards.length === 0;
  }

  public addCard(card: Card): void {
    this.cards.push(card);
  }
}

export default Deck;