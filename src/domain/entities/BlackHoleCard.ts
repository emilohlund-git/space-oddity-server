import Card, { CardType } from './Card';
import Player from './Player';

class BlackHoleCard extends Card {
  constructor(graphic: string, owner?: Player) {
    super(graphic, CardType.BlackHole, owner);
  }
}

export default BlackHoleCard;