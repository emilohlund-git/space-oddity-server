export class User {
  public id: string;

  public username: string;

  constructor(id: string, username: string, public readonly lobby?: string) {
    this.id = id;
    this.username = username;
  }
}
