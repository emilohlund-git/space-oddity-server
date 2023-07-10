import InsufficientCardsException from '../../application/exceptions/insufficient-cards.exception';
import Card from './Card';

class Deck {
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