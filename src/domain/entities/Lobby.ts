import { User } from './User';

export class Lobby {
  private users: User[] = [];

  constructor(public readonly id: string) { }

  public addUser(user: User): void {
    this.users.push(user);
  }

  public removeUser(userId: string): void {
    const index = this.users.findIndex((user) => user.id === userId);
    if (index !== -1) {
      this.users.splice(index, 1);
    }
  }

  public getUsers(): User[] {
    return this.users;
  }

  // Add other lobby-related behavior and methods as needed
}
