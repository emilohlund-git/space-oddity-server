import BlackHoleCard from '../../domain/entities/BlackHoleCard';
import Card from '../../domain/entities/Card';
import Deck from '../../domain/entities/Deck';
import TwistedCard, { SpecialEffect } from '../../domain/entities/TwistedCard';

export const createCard = (value: number): Card => {
  if (value === 21 || value === 22) {
    return new BlackHoleCard(value);
  } else if (value === 23) {
    return new TwistedCard(value, SpecialEffect.SwitchLight);
  } else if (value === 24) {
    return new TwistedCard(value, SpecialEffect.SwapHand);
  } else if (value === 25) {
    return new TwistedCard(value, SpecialEffect.SneakAPeak);
  } else {
    return new Card(value);
  }
};

export const getShuffledDeck = (): Deck => {
  const cards = <Card[]>[];

  for (let value = 1; value <= 25; value++) {
    const card = createCard(value);
    cards.push(card);

    if (value !== 19 &&
      (card instanceof TwistedCard === false ||
        card instanceof BlackHoleCard === false)) {
      cards.push(card.clone());
    }
  }

  const deck = new Deck();
  deck.setCards(cards);

  deck.shuffle();

  return deck;
};