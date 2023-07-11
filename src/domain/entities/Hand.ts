import Card from './Card';

class Hand {
  private cards: Card[];

  constructor() {
    this.cards = [];
  }

  public getCard(cardId: string) {
    return this.cards.find((c) => c.id === cardId);
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
      this.cards[index].setOwner(undefined);
      this.cards.splice(index, 1);
    }
  }
}

export default Hand;