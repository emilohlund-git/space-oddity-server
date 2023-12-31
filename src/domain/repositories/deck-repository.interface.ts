import { UUID } from 'crypto';
import Deck from '../entities/Deck';

export interface DeckRepository {
  save(deck: Deck): void;
  findById(id: string): Deck | undefined;
  findAll(): Deck[];
  clear(): void;
  remove(deckId: UUID): void;
}