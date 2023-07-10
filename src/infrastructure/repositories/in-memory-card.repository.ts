import Card from '../../domain/entities/Card';
import { CardRepository } from '../../domain/repositories/card-repository.interface';

export class InMemoryCardRepository implements CardRepository {
  private cards: Map<string, Card>;

  constructor() {
    this.cards = new Map<string, Card>();
  }

  findByPlayer(userId: string): Card | undefined {
    return Array.from(this.cards.values()).find((c) => c.getOwner()?.getId() === userId);
  }

  save(card: Card): void {
    this.cards.set(card.id, card);
  }

  findById(id: string): Card | undefined {
    return this.cards.get(id);
  }

  findAll(): Card[] {
    return Array.from(this.cards.values());
  }

  clear() {
    this.cards = new Map<string, Card>();
  }

  // Implement other methods as needed
}