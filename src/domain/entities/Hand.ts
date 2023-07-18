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

  public setCards(cards: Card[]): void {
    this.cards = cards;
  }

  public addCard(card: Card): void {
    this.cards.push(card);
  }

  public addCards(cards: Card[]): void {
    for (const card of cards)
      this.cards.push(card);
  }

  public removeCard(card: Card): void {
    const index = this.cards.indexOf(card);
    if (index !== -1) {
      this.cards.splice(index, 1);
    }
  }

  public removeCards(cards: Card[]): void {
    for (const card of cards) {
      const index = this.cards.indexOf(card);
      if (index !== -1) {
        this.cards.splice(index, 1);
      }
    }
  }

  public getMatches(): Card[] {
    const matches: Card[] = [];

    for (let i = 0; i < this.cards.length; i++) {
      const cardA = this.cards[i];
      for (let j = i + 1; j < this.cards.length; j++) {
        const cardB = this.cards[j];
        if (cardA.getValue() === cardB.getValue()) {
          matches.push(cardA, cardB);
        }
      }
    }

    return matches;
  }
}

export default Hand;