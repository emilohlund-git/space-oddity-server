import Card, { CardType } from './Card';

class BlackHoleCard extends Card {
  constructor(value: number) {
    super(value, CardType.BlackHole);
  }
}

export default BlackHoleCard;