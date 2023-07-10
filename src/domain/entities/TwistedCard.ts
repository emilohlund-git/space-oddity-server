import Card, { CardType } from './Card';
import Player from './Player';

export enum SpecialEffect {
  SneakAPeak,
  SwapHand,
  SwitchLight,
}

class TwistedCard extends Card {
  private specialEffect: SpecialEffect;

  constructor(graphic: string, specialEffect: SpecialEffect, owner?: Player) {
    super(graphic, CardType.Twisted, owner);
    this.specialEffect = specialEffect;
  }

  public getSpecialEffect(): SpecialEffect {
    return this.specialEffect;
  }

  public play(): void {
    // Logic for what happens when the card is played
  }
}

export default TwistedCard;