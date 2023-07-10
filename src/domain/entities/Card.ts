import { UUID, randomUUID } from 'crypto';
import Player from './Player';

export enum CardType {
  Regular,
  Twisted,
  BlackHole,
}

class Card {
  public id: UUID = randomUUID();

  private owner?: Player;

  private graphic: string;

  private type: CardType;

  constructor(graphic: string, type: CardType = CardType.Regular, owner?: Player) {
    this.owner = owner;
    this.graphic = graphic;
    this.type = type;
  }

  public getOwner(): Player | undefined {
    return this.owner ? this.owner : undefined;
  }

  public setOwner(owner: Player | undefined) {
    this.owner = owner;
  }

  public getGraphic(): string {
    return this.graphic;
  }

  public getType(): CardType {
    return this.type;
  }
}

export default Card;