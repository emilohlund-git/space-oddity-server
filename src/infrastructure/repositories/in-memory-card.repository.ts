import { UUID } from 'crypto';
import Card from '../../domain/entities/Card';
import Player from '../../domain/entities/Player';
import { CardRepository } from '../../domain/repositories/card-repository.interface';

export class InMemoryCardRepository implements CardRepository {
  private cards: Map<UUID, Card>;

  constructor() {
    this.cards = new Map<UUID, Card>();
  }

  findByPlayer(player: Player): Card[] {
    const hand = player.getHand();
    const cards = Array.from(this.cards.values());
    return cards.filter((c) => hand.getCards().includes(c));
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