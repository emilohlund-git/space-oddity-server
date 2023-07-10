import Player from '../entities/Player';
import { User } from '../entities/User';

export interface UserRepository {
  save(user: User): void;
  findById(id: string): Player | undefined;
  findByUsername(username: string): Player | undefined;
  findAll(): Player[];
  clear(): void;
  // Add other necessary methods for retrieving, updating, and deleting lobbies
}