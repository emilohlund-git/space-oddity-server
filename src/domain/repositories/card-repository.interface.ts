import Card from '../entities/Card';
import Player from '../entities/Player';

export interface CardRepository {
  save(card: Card): void;
  findById(id: string): Card | undefined;
  findByPlayer(player: Player): Card[];
  findAll(): Card[];
  clear(): void;
}