import { User } from './User';

export class Lobby {
  constructor(public readonly id: string, private readonly users: User[]) { }

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
