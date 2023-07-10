import { UUID } from 'crypto';
import Card from '../../domain/entities/Card';
import { CardRepository } from '../../domain/repositories/card-repository.interface';

export class InMemoryCardRepository implements CardRepository {
  private cards: Map<UUID, Card>;

  constructor() {
    this.cards = new Map<UUID, Card>();
  }

  findByPlayer(userId: UUID): Card | undefined {
    return Array.from(this.cards.values()).find((c) => c.getOwner()?.getId() === userId);
  }

  save(card: Card): void {
    this.cards.set(card.id, card);
  }

  findById(id: UUID): Card | undefined {
    return this.cards.get(id);
  }

  findAll(): Card[] {
    return Array.from(this.cards.values());
  }

  clear() {
    this.cards = new Map<UUID, Card>();
  }

  // Implement other methods as needed
}