import Card from './Card';
import Player from './Player';

class Hand {
  private player: Player | undefined;

  private cards: Card[];

  constructor() {
    this.cards = [];
  }

  public getPlayer(): Player | undefined {
    return this.player;
  }

  public setPlayer(player: Player) {
    this.player = player;
  }

  public getCards(): Card[] {
    return this.cards;
  }

  public addCard(card: Card): void {
    card.setOwner(this.player);
    this.cards.push(card);
  }

  public addCards(cards: Card[]): void {
    cards.forEach((c) => c.setOwner(this.player));
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