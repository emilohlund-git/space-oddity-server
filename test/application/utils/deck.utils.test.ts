import { createCard } from '../../../src/application/utils/deck.utils';
import BlackHoleCard from '../../../src/domain/entities/BlackHoleCard';
import Card from '../../../src/domain/entities/Card';
import TwistedCard from '../../../src/domain/entities/TwistedCard';

describe('DeckUtils', () => {
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