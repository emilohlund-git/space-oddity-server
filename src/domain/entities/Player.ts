import Card from './Card';
import Hand from './Hand';
import { User } from './User';

class Player extends User {
  private hand: Hand;

  constructor(id: string, username: string, hand: Hand) {
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

  public addToHand(card: Card): void {
    this.hand.addCard(card);
  }

  public removeFromHand(card: Card): void {
    this.hand.removeCard(card);
  }
}

export default Player;