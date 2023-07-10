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
      throw new Error('Insufficient cards in the deck.');
    }

    const drawnCards = this.cards.splice(0, count);
    return drawnCards;
  }

  public shuffle(): void {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
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