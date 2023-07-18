import { UUID } from 'crypto';
import Player from '../../domain/entities/Player';
import { UserRepository } from '../../domain/repositories/user-repository.interface';

export class InMemoryUserRepository implements UserRepository {
  private users: Map<UUID, Player>;

  constructor() {
    this.users = new Map<UUID, Player>();
  }

  save(user: Player): void {
    this.users.set(user.id, user);
  }

  saveMany(players: Player[]): void {
    for (const player of players) {
      this.users.set(player.id, player);
    }
  }

  findByUsername(username: string): Player | undefined {
    const users = this.findAll();
    const user = users.find((u) => u.username === username);
    if (user) return user;
    return undefined;
  }

  findById(userId: UUID): Player | undefined {
    return this.users.get(userId);
  }

  remove(userId: UUID): void {
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
    this.users = new Map<UUID, Player>();
  }

  // Implement other methods as needed
}