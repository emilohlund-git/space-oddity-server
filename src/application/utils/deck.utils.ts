import BlackHoleCard from '../../domain/entities/BlackHoleCard';
import Card from '../../domain/entities/Card';
import Deck from '../../domain/entities/Deck';
import TwistedCard, { SpecialEffect } from '../../domain/entities/TwistedCard';

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