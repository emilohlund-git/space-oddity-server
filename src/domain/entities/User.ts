import { UUID, randomUUID } from 'crypto';

export class User {
  public id: UUID = randomUUID();

  public username: string;

  constructor(username: string, id?: UUID) {
    if (id) {
      this.id = id;
    }
    this.username = username;
  }
}
