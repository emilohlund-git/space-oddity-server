import BlackHoleCard from '../../domain/entities/BlackHoleCard';
import Card, { CardType } from '../../domain/entities/Card';
import Deck from '../../domain/entities/Deck';
import TwistedCard, { SpecialEffect } from '../../domain/entities/TwistedCard';

export enum TwistedCardDescription {
  SwitchLight = 'Play this card to change the light color.',
  SwapHand = 'Play this card and choose an opponent to swap hands with.',
  SneakAPeak = 'Play this card and choose an opponent to spy on and pick a card from their hand.',
}

export const createCard = (value: number): Card => {
  if (value === 21 || value === 22) {
    return new BlackHoleCard(value);
  } else if (value === 23) {
    return new TwistedCard(value, SpecialEffect.SwitchLight, TwistedCardDescription.SwitchLight);
  } else if (value === 24) {
    return new TwistedCard(value, SpecialEffect.SwapHand, TwistedCardDescription.SwapHand);
  } else if (value === 25) {
    return new TwistedCard(value, SpecialEffect.SneakAPeak, TwistedCardDescription.SneakAPeak);
  } else {
    return new Card(value);
  }
};

export const getShuffledDeck = (): Deck => {
  const cards = <Card[]>[];

  for (let value = 1; value <= 25; value++) {
    const card = createCard(value);
    cards.push(card);

    if (card.getType() !== CardType.Regular) {
      continue;
    }

    if (value !== 19) {
      cards.push(card.clone());
    }
  }

  const deck = new Deck();
  deck.setCards(cards);

  deck.shuffle();

  return deck;
};