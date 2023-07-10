import Card from './Card';

class Hand {
  private playerId: string;

  private cards: Card[];

  constructor(playerId: string) {
    this.playerId = playerId;
    this.cards = [];
  }

  public getPlayerId(): string {
    return this.playerId;
  }

  public getCards(): Card[] {
    return this.cards;
  }

  public addCard(card: Card): void {
    this.cards.push(card);
  }

  public addCards(cards: Card[]): void {
    this.cards.push(...cards);
  }

  public removeCard(card: Card): void {
    const index = this.cards.indexOf(card);
    if (index !== -1) {
      this.cards.splice(index, 1);
    }
  }
}

export default Hand;