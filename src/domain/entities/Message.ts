import { UUID, randomUUID } from 'crypto';
import Player from './Player';

export class Message {
  public id: UUID = randomUUID();

  public player: Player;

  public content: string;

  constructor(player: Player, content: string) {
    this.player = player;
    this.content = content;
  }
}
