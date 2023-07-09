import { User } from '../../domain/entities/User';
import { UserRepository } from '../../domain/repositories/user-repository.interface';

export class InMemoryUserRepository implements UserRepository {
  private users: Map<string, User>;

  constructor() {
    this.users = new Map<string, User>();
  }

  save(user: User): void {
    this.users.set(user.id, user);
  }

  findByUsername(username: string): User | undefined {
    const users = this.findAll();
    const user = users.find((u) => u.username === username);
    if (user) return user;
    return undefined;
  }

  findById(id: string): User | undefined {
    return this.users.get(id);
  }

  findAll(): User[] {
    return Array.from(this.users.values());
  }

  clear() {
    this.users = new Map<string, User>();
  }

  // Implement other methods as needed
}