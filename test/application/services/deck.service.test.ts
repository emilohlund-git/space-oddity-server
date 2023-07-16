import { DeckService } from '../../../src/application/services/deck.service';
import Deck from '../../../src/domain/entities/Deck';
import { DeckRepository } from '../../../src/domain/repositories/deck-repository.interface';
import { InMemoryDeckRepository } from '../../../src/infrastructure/repositories/in-memory-deck.repository';

describe('DeckService', () => {
  let deckRepository: DeckRepository;
  let deckService: DeckService;

  beforeEach(() => {
    deckRepository = new InMemoryDeckRepository();
    deckService = new DeckService(deckRepository);
  });

  describe('remove', () => {
    test('should remove a deck by id', () => {
      const deck = new Deck();

      deckService.save(deck);

      expect(deckService.findById(deck.id)).toBe(deck);

      deckService.remove(deck.id);

      expect(deckService.findById(deck.id)).toBeUndefined();
    });
  });

  describe('findById', () => {
    test('should return a deck by id', (done) => {
      const deck = new Deck();

      deckService.save(deck);

      expect(deckService.findById(deck.id)).toBe(deck);

      done();
    });
  });

  describe('findAll', () => {
    test('Should return a list of all decks', (done) => {
      let decks = deckService.findAll();

      expect(decks).toHaveLength(0);

      const deck = new Deck();

      deckService.save(deck);

      decks = deckService.findAll();

      expect(decks).toHaveLength(1);

      done();
    });
  });
});