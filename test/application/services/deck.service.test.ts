import { DeckService } from '../../../src/application/services/deck.service';
import Deck from '../../../src/domain/entities/Deck';
import { DeckRepository } from '../../../src/domain/repositories/deck-repository.interface';
import { InMemoryDeckRepository } from '../../../src/infrastructure/repositories/in-memory-deck.repository';

describe('DeckService', () => {
  let deckRepository: DeckRepository;
  let deckService: DeckService;

  beforeAll(() => {
    deckRepository = new InMemoryDeckRepository();
    deckService = new DeckService(deckRepository);
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