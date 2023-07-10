import Card from '../entities/Card';

export interface CardRepository {
  save(user: Card): void;
  findById(id: string): Card | undefined;
  findByPlayer(userId: string): Card | undefined;
  findAll(): Card[];
  clear(): void;
}