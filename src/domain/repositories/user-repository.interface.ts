import { UUID } from 'crypto';
import Player from '../entities/Player';
import { User } from '../entities/User';

export interface UserRepository {
  save(user: User): void;
  saveMany(players: Player[]): void;
  findById(id: UUID): Player | undefined;
  findByUsername(username: string): Player | undefined;
  remove(userId: UUID): void;
  removeMany(players: Player[]): void;
  findAll(): Player[];
  clear(): void;
  // Add other necessary methods for retrieving, updating, and deleting lobbies
}