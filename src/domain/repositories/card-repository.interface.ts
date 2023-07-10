import Card from '../entities/Card';

export interface CardRepository {
  save(card: Card): void;
  findById(id: string): Card | undefined;
  findByPlayer(userId: string): Card | undefined;
  findAll(): Card[];
  clear(): void;
}