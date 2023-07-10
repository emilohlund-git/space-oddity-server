import Deck from '../../domain/entities/Deck';
import { DeckRepository } from '../../domain/repositories/deck-repository.interface';

export class InMemoryDeckRepository implements DeckRepository {
  private decks: Map<string, Deck>;

  constructor() {
    this.decks = new Map<string, Deck>();
  }

  save(deck: Deck): void {
    this.decks.set(deck.id, deck);
  }

  findById(id: string): Deck | undefined {
    return this.decks.get(id);
  }

  findAll(): Deck[] {
    return Array.from(this.decks.values());
  }

  clear() {
    this.decks = new Map<string, Deck>();
  }

  // Implement other methods as needed
}