import { UUID } from 'crypto';
import Deck from '../../domain/entities/Deck';
import { DeckRepository } from '../../domain/repositories/deck-repository.interface';

export class DeckService {
  private deckRepository: DeckRepository;

  constructor(deckRepository: DeckRepository) {
    this.deckRepository = deckRepository;
  }

  save(deck: Deck): void {
    this.deckRepository.save(deck);
  }

  findById(deckId: string) {
    return this.deckRepository.findById(deckId);
  }

  findAll(): Deck[] {
    return this.deckRepository.findAll();
  }

  remove(deckId: UUID): void {
    this.deckRepository.remove(deckId);
  }
}