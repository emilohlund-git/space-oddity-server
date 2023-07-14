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
  1: 'graphic1.png',
  2: 'graphic2.png',
  3: 'graphic3.png',
  4: 'graphic4.png',
  5: 'graphic5.png',
  6: 'graphic6.png',
  7: 'graphic7.png',
  8: 'graphic8.png',
  9: 'graphic9.png',
  10: 'graphic10.png',
  11: 'graphic11.png',
  12: 'graphic12.png',
  13: 'graphic13.png',
  14: 'graphic14.png',
  15: 'graphic15.png',
  16: 'graphic16.png',
  17: 'graphic17.png',
  18: 'graphic18.png',
  19: 'graphic19.png',
  20: 'graphic20.png',
  21: 'graphic21.png',
  22: 'graphic22.png',
  23: 'twistedCard1.png',
  24: 'twistedCard2.png',
  25: 'twistedCard3.png',
  26: 'blackHoleCard1.png',
  27: 'blackHoleCard2.png',
};

class Card {
  public id: UUID = randomUUID();

  private type: CardType;

  private value: number;

  constructor(value: number, type: CardType = CardType.Regular) {
    this.value = value;
    this.type = type;
  }

  public getValue(): number | undefined {
    return this.value;
  }

  public setValue(value: number): void {
    this.value = value;
  }

  public getGraphic(): string {
    return this.getGraphicByValue(this.value);
  }

  public getType(): CardType {
    return this.type;
  }

  private getGraphicByValue(value: number): string {
    return cardGraphicMapping[value] || 'defaultGraphic.png';
  }
}

export default Card;