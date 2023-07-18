import { UUID, randomUUID } from 'crypto';
import Deck from './Deck';
import { Message } from './Message';
import Player from './Player';

export class Lobby {
  public id: UUID = randomUUID();

  public lastActivityTime: number = Date.now();

  private users: Player[] = [];

  private messages: Message[] = [];

  private deck?: Deck;

  private host: Player;

  constructor(host: Player) {
    this.host = host;
    this.users.push(host);
  }

  public getHost(): Player {
    return this.host;
  }

  public setHost(player: Player) {
    this.host = player;
  }

  public addMessage(message: Message) {
    this.messages.push(message);
  }

  public getMessages(): Message[] {
    return this.messages;
  }

  public setDeck(deck: Deck | undefined): void {
    this.deck = deck;
  }

  public getDeck(): Deck | undefined {
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

  public setPlayers(players: Player[]): void {
    this.users = players;
  }

  // Add other lobby-related behavior and methods as needed
}
