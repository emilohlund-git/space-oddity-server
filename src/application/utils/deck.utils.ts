import BlackHoleCard from '../../domain/entities/BlackHoleCard';
import Card from '../../domain/entities/Card';
import Deck from '../../domain/entities/Deck';
import TwistedCard, { SpecialEffect } from '../../domain/entities/TwistedCard';

export const getShuffledDeck = (): Deck => {
  const cards = <Card[]>[];
  cards.push(new TwistedCard(23, SpecialEffect.SneakAPeak));
  cards.push(new TwistedCard(24, SpecialEffect.SwapHand));
  cards.push(new TwistedCard(25, SpecialEffect.SwitchLight));
  cards.push(new BlackHoleCard(26));
  cards.push(new BlackHoleCard(27));

  for (let value = 1; value <= 21; value++) {
    const card = new Card(value);
    const cardCopy = new Card(value);
    cards.push(card);
    cards.push(cardCopy);
  }

  const deck = new Deck();
  deck.setCards(cards);

  deck.shuffle();

  return deck;
};