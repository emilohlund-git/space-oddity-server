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
  1: 'https://images2.imgbox.com/6d/71/YiZiLLZk_o.jpg',
  2: 'https://images2.imgbox.com/51/ba/Il2z3Etg_o.jpg',
  3: 'https://images2.imgbox.com/e7/3d/dWbCVmz0_o.jpg',
  4: 'https://images2.imgbox.com/b7/e2/18fYFroB_o.jpg',
  5: 'https://images2.imgbox.com/5e/12/KxXmIf6q_o.jpg',
  6: 'https://images2.imgbox.com/5d/c3/8oE1L4tc_o.jpg',
  7: 'https://images2.imgbox.com/f1/b6/6tFK4Mpk_o.jpg',
  8: 'https://images2.imgbox.com/30/ae/T2AyS4IT_o.jpg',
  9: 'https://images2.imgbox.com/4b/c2/0ItrHvha_o.jpg',
  10: 'https://images2.imgbox.com/6c/25/MSjDn4RJ_o.jpg',
  11: 'https://images2.imgbox.com/cf/49/l5LPLQNm_o.jpg',
  12: 'https://images2.imgbox.com/d1/25/FNu8Hyg0_o.jpg',
  13: 'https://images2.imgbox.com/f9/c0/9JNnKdFg_o.jpg',
  14: 'https://images2.imgbox.com/ab/ac/43lsf4Pc_o.jpg',
  15: 'https://images2.imgbox.com/38/12/mFGSua9b_o.jpg',
  16: 'https://images2.imgbox.com/76/0e/tvMJEOQp_o.jpg',
  17: 'https://images2.imgbox.com/e0/fa/Pjdk5jgA_o.jpg',
  18: 'https://images2.imgbox.com/00/1a/W03KkLfD_o.jpg',
  19: 'https://images2.imgbox.com/21/15/0jA5WJpj_o.jpg',
  20: 'https://images2.imgbox.com/77/20/kg74LbP1_o.jpg',
  21: 'https://images2.imgbox.com/f4/62/PQI4f9i6_o.jpg',
  22: 'https://images2.imgbox.com/b2/48/NWbRBXD7_o.jpg',
  23: 'https://images2.imgbox.com/e4/4e/ncXQ47LE_o.jpg',
  24: 'https://images2.imgbox.com/77/84/U1Mvmofk_o.jpg',
  25: 'https://images2.imgbox.com/ce/56/ZQ0eEjSY_o.jpg',
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
}

export default Card;