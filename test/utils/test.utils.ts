import BlackHoleCard from '../../src/domain/entities/BlackHoleCard';
import Card from '../../src/domain/entities/Card';
import Deck from '../../src/domain/entities/Deck';
import TwistedCard, { SpecialEffect } from '../../src/domain/entities/TwistedCard';

export const getShuffledDeck = (): Deck => {
  const cards = <Card[]>[];
  cards.push(new TwistedCard('', SpecialEffect.SneakAPeak));
  cards.push(new TwistedCard('', SpecialEffect.SwapHand));
  cards.push(new TwistedCard('', SpecialEffect.SwitchLight));
  cards.push(new BlackHoleCard(''));
  cards.push(new BlackHoleCard(''));

  for (let i = 0; i < 42; i++) {
    cards.push(new Card(''));
  }

  const deck = new Deck();
  deck.setCards(cards);

  deck.shuffle();

  return deck;
};