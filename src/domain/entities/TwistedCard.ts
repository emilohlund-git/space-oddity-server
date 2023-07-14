import Card, { CardType } from './Card';

export enum SpecialEffect {
  SneakAPeak,
  SwapHand,
  SwitchLight,
}

class TwistedCard extends Card {
  private specialEffect: SpecialEffect;

  constructor(value: number, specialEffect: SpecialEffect) {
    super(value, CardType.Twisted);
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