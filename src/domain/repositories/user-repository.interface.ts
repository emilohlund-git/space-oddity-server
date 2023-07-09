import { User } from '../entities/User';

export interface UserRepository {
  save(user: User): void;
  findById(id: string): User | undefined;
  // Add other necessary methods for retrieving, updating, and deleting lobbies
}