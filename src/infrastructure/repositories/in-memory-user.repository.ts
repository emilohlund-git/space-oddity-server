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

  findById(id: string): User | undefined {
    return this.users.get(id);
  }

  findAll(): User[] {
    return Array.from(this.users.values());
  }

  // Implement other methods as needed
}