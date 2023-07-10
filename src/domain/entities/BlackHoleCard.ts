import Card, { CardType } from './Card';
import Player from './Player';

class BlackHoleCard extends Card {
  constructor(owner: Player, graphic: string) {
    super(owner, graphic, CardType.BlackHole);
  }
}

export default BlackHoleCard;