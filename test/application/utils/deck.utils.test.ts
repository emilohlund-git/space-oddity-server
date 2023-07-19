import { createCard } from '../../../src/application/utils/deck.utils';
import BlackHoleCard from '../../../src/domain/entities/BlackHoleCard';
import Card, { CardType } from '../../../src/domain/entities/Card';
import TwistedCard from '../../../src/domain/entities/TwistedCard';
import { getShuffledDeck } from '../../utils/test.utils';

describe('DeckUtils', () => {
  describe('getShuffledDeck', () => {
    test('should not create copies of special cards', () => {
      const deck = getShuffledDeck();

      const twistedCards = deck.getCards().filter((c) => c instanceof TwistedCard);

      expect(twistedCards).toHaveLength(3);

      const blackHoleCards = deck.getCards().filter((c) => c instanceof BlackHoleCard);

      expect(blackHoleCards).toHaveLength(2);

      const regularCards = deck.getCards().filter((c) => c.getType() === CardType.Regular);

      expect(regularCards).toHaveLength(42);

      expect(deck.getCards()).toHaveLength(47);
    });
  });

  describe('createCard', () => {
    test('should get expected cards from set values', () => {
      const values = [1, 2, 3, 21, 22, 23, 24, 25];
      const cards = <Card[]>[];

      for (const value of values) {
        cards.push(createCard(value));
      }

      expect(cards[0]).toBeInstanceOf(Card);
      expect(cards[1]).toBeInstanceOf(Card);
      expect(cards[2]).toBeInstanceOf(Card);
      expect(cards[3]).toBeInstanceOf(BlackHoleCard);
      expect(cards[4]).toBeInstanceOf(BlackHoleCard);
      expect(cards[5]).toBeInstanceOf(TwistedCard);
      expect(cards[6]).toBeInstanceOf(TwistedCard);
      expect(cards[7]).toBeInstanceOf(TwistedCard);
    });
  });
});