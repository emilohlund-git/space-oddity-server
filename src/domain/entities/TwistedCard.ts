import Card, { CardType } from './Card';

export enum SpecialEffect {
  SneakAPeak,
  SwapHand,
  SwitchLight,
}

class TwistedCard extends Card {
  private specialEffect: SpecialEffect;

  private description?: string;

  constructor(value: number, specialEffect: SpecialEffect, description?: string) {
    super(value, CardType.Twisted);
    this.specialEffect = specialEffect;
    this.description = description;
  }

  public getSpecialEffect(): SpecialEffect {
    return this.specialEffect;
  }

  public getDescription(): string | undefined {
    return this.description;
  }

  public play(): void {
    // Logic for what happens when the card is played
  }
}

export default TwistedCard;