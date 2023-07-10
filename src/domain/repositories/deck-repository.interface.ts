import Deck from '../entities/Deck';

export interface DeckRepository {
  save(user: Deck): void;
  findById(id: string): Deck | undefined;
  findAll(): Deck[];
  clear(): void;
}