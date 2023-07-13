import Card, { CardType } from './Card';

class BlackHoleCard extends Card {
  constructor(graphic: string) {
    super(graphic, CardType.BlackHole);
  }
}

export default BlackHoleCard;