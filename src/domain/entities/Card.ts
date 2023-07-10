import Player from './Player';

export enum CardType {
  Regular,
  Twisted,
  BlackHole,
}

class Card {
  private owner: Player;

  private graphic: string;

  private type: CardType;

  constructor(owner: Player, graphic: string, type: CardType = CardType.Regular) {
    this.owner = owner;
    this.graphic = graphic;
    this.type = type;
  }

  public getOwner(): Player {
    return this.owner;
  }

  public getGraphic(): string {
    return this.graphic;
  }

  public getType(): CardType {
    return this.type;
  }
}

export default Card;