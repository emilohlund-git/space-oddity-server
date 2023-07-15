import Card from './Card';
import Hand from './Hand';
import TwistedCard from './TwistedCard';
import { User } from './User';

class Player extends User {
  private hand: Hand;

  private isReady: boolean = false;

  constructor(id: string, username: string, hand: Hand = new Hand()) {
    super(id, username);

    this.hand = hand;
  }

  public getId(): string {
    return this.id;
  }

  public getUserName(): string {
    return this.username;
  }

  public getHand(): Hand {
    return this.hand;
  }

  public setHand(hand: Hand) {
    this.hand = hand;
  }

  public getTwistedCard(): Card | undefined {
    for (const card of this.hand.getCards()) {
      if (card instanceof TwistedCard) {
        return card;
      }
    }
    return undefined;
  }

  public addToHand(card: Card): void {
    this.hand.addCard(card);
  }

  public addManyToHand(cards: Card[]): void {
    this.hand.addCards(cards);
  }

  public removeFromHand(card: Card): void {
    this.hand.removeCard(card);
  }

  public setIsReady() {
    this.isReady = true;
  }

  public getIsReady() {
    return this.isReady;
  }
}

export default Player;