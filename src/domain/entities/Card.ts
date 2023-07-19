import { UUID, randomUUID } from 'crypto';

export enum CardType {
  Regular,
  Twisted,
  BlackHole,
}

type CardGraphicMapping = {
  [key: number]: string;
};

export const cardGraphicMapping: CardGraphicMapping = {
  1: 'https://ik.imagekit.io/cl1rb894z/space-oddity/tr:w-300/1.Card.jpg?updatedAt=1689531244512',
  2: 'https://ik.imagekit.io/cl1rb894z/space-oddity/tr:w-300/2.cARD.jpg?updatedAt=1689531240554',
  3: 'https://ik.imagekit.io/cl1rb894z/space-oddity/tr:w-300/3.Card.jpg?updatedAt=1689531243568',
  4: 'https://ik.imagekit.io/cl1rb894z/space-oddity/tr:w-300/4.Card_copie.jpg?updatedAt=1689531240766',
  5: 'https://ik.imagekit.io/cl1rb894z/space-oddity/tr:w-300/5.Card.jpg?updatedAt=1689531230060',
  6: 'https://ik.imagekit.io/cl1rb894z/space-oddity/tr:w-300/6.Card.jpg?updatedAt=1689531243468',
  7: 'https://ik.imagekit.io/cl1rb894z/space-oddity/tr:w-300/7.Card.jpg?updatedAt=1689531236556',
  8: 'https://ik.imagekit.io/cl1rb894z/space-oddity/tr:w-300/8.Card.jpg?updatedAt=1689531236465',
  9: 'https://ik.imagekit.io/cl1rb894z/space-oddity/tr:w-300/9.Card.jpg?updatedAt=1689531240990',
  10: 'https://ik.imagekit.io/cl1rb894z/space-oddity/tr:w-300/10.Card.jpg?updatedAt=1689531284055',
  11: 'https://ik.imagekit.io/cl1rb894z/space-oddity/tr:w-300/11.Card.jpg?updatedAt=1689531302699',
  12: 'https://ik.imagekit.io/cl1rb894z/space-oddity/tr:w-300/12.Card.jpg?updatedAt=1689531286903',
  13: 'https://ik.imagekit.io/cl1rb894z/space-oddity/tr:w-300/13.Card.jpg?updatedAt=1689531324100',
  14: 'https://ik.imagekit.io/cl1rb894z/space-oddity/tr:w-300/14.Card.jpg?updatedAt=1689531306882',
  15: 'https://ik.imagekit.io/cl1rb894z/space-oddity/tr:w-300/15.Card.jpg?updatedAt=1689531283957',
  16: 'https://ik.imagekit.io/cl1rb894z/space-oddity/tr:w-300/16.Card.jpg?updatedAt=1689531310365',
  17: 'https://ik.imagekit.io/cl1rb894z/space-oddity/tr:w-300/17.Card.jpg?updatedAt=1689531312950',
  18: 'https://ik.imagekit.io/cl1rb894z/space-oddity/tr:w-300/22.Card_2.jpg?updatedAt=1689531247901',
  19: 'https://ik.imagekit.io/cl1rb894z/space-oddity/tr:w-300/18.Card.jpg?updatedAt=1689531285329',
  20: 'https://ik.imagekit.io/cl1rb894z/space-oddity/tr:w-300/21.Card.jpg?updatedAt=1689531323894',
  21: 'https://ik.imagekit.io/cl1rb894z/space-oddity/tr:w-300/19.Card_BLUE_BLACKHOLE.jpg?updatedAt=1689531301109',
  22: 'https://ik.imagekit.io/cl1rb894z/space-oddity/tr:w-300/20.Card_RED_BLACKHOLE.jpg?updatedAt=1689531328308',
  23: 'https://ik.imagekit.io/cl1rb894z/space-oddity/tr:w-300/Sans_titre-1_copie_3.jpg?updatedAt=1689531326724',
  24: 'https://ik.imagekit.io/cl1rb894z/space-oddity/tr:w-300/Sans_titre-1.jpg?updatedAt=1689531331695',
  25: 'https://ik.imagekit.io/cl1rb894z/space-oddity/tr:w-300/Sans_tkkitre-1.jpg?updatedAt=1689531321806',
};

class Card {
  public id: UUID = randomUUID();

  private type: CardType;

  private value: number;

  private graphic: string;

  constructor(value: number, type: CardType = CardType.Regular) {
    this.value = value;
    this.type = type;
    this.graphic = this.getGraphicByValue(value);
  }

  public getValue(): number | undefined {
    return this.value;
  }

  public setValue(value: number): void {
    this.value = value;
    this.graphic = this.getGraphicByValue(value);
  }

  public getGraphic(): string {
    return this.graphic;
  }

  public getType(): CardType {
    return this.type;
  }

  private getGraphicByValue(value: number): string {
    return cardGraphicMapping[value] || 'defaultGraphic.png';
  }

  public clone(): Card {
    return new Card(this.value);
  }
}

export default Card;