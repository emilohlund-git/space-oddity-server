import Player from '../../domain/entities/Player';
import { UserRepository } from '../../domain/repositories/user-repository.interface';

export class InMemoryUserRepository implements UserRepository {
  private users: Map<string, Player>;

  constructor() {
    this.users = new Map<string, Player>();
  }

  save(user: Player): void {
    this.users.set(user.id, user);
  }

  findByUsername(username: string): Player | undefined {
    const users = this.findAll();
    const user = users.find((u) => u.username === username);
    if (user) return user;
    return undefined;
  }

  findById(id: string): Player | undefined {
    return this.users.get(id);
  }

  remove(userId: string): void {
    this.users.delete(userId);
  }

  removeMany(players: Player[]): void {
    for (const player of players) {
      this.users.delete(player.id);
    }
  }

  findAll(): Player[] {
    return Array.from(this.users.values());
  }

  clear() {
    this.users = new Map<string, Player>();
  }

  // Implement other methods as needed
}