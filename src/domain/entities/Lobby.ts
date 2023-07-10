import { UUID } from 'crypto';
import Deck from './Deck';
import Player from './Player';

export class Lobby {
  private users: Player[] = [];

  private deck: Deck;

  constructor(public readonly id: UUID, deck: Deck) {
    this.deck = deck;
  }

  public setDeck(deck: Deck): void {
    this.deck = deck;
  }

  public getDeck(): Deck {
    return this.deck;
  }

  public addUser(user: Player): void {
    this.users.push(user);
  }

  public removeUser(userId: string): void {
    const index = this.users.findIndex((user) => user.id === userId);
    if (index !== -1) {
      this.users.splice(index, 1);
    }
  }

  public getPlayers(): Player[] {
    return this.users;
  }

  // Add other lobby-related behavior and methods as needed
}
