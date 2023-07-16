import Deck from '../../../src/domain/entities/Deck';
import { DeckRepository } from '../../../src/domain/repositories/deck-repository.interface';
import { InMemoryDeckRepository } from '../../../src/infrastructure/repositories/in-memory-deck.repository';

describe('DeckRepository', () => {
  let deckRepository: DeckRepository;

  beforeAll(() => {
    deckRepository = new InMemoryDeckRepository();
  });

  test('should remove a deck', () => {
    const deck = new Deck();
    deckRepository.save(deck);
    expect(deckRepository.findAll().length).toBe(1);
    deckRepository.remove(deck.id);
    expect(deckRepository.findAll().length).toBe(0);
  });

  test('should add a deck to the repository and then clear', (done) => {
    expect(deckRepository.findAll().length).toBe(0);
    const deck = new Deck();
    deckRepository.save(deck);
    expect(deckRepository.findAll().length).toBe(1);
    deckRepository.clear();
    expect(deckRepository.findAll().length).toBe(0);
    done();
  });

  test('should find a deck by id', (done) => {
    let deck = new Deck();
    deckRepository.save(deck);
    expect(deckRepository.findById(deck.id)).toBeDefined();
    done();
  });
});