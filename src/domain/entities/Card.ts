import { UUID, randomUUID } from 'crypto';

export enum CardType {
  Regular,
  Twisted,
  BlackHole,
}

class Card {
  public id: UUID = randomUUID();

  private graphic: string;

  private type: CardType;

  constructor(graphic: string, type: CardType = CardType.Regular) {
    this.graphic = graphic;
    this.type = type;
  }

  public getGraphic(): string {
    return this.graphic;
  }

  public getType(): CardType {
    return this.type;
  }
}

export default Card;