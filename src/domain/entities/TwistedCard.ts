import Card, { CardType } from './Card';
import Player from './Player';

export enum SpecialEffect {
  SneakAPeak,
  SwapDeck,
  SwitchLight,
}

class TwistedCard extends Card {
  private specialEffect: SpecialEffect;

  constructor(owner: Player, graphic: string, specialEffect: SpecialEffect) {
    super(owner, graphic, CardType.Twisted);
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