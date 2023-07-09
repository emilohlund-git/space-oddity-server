import { randomUUID } from 'crypto';
import { Lobby } from '../src/domain/entities/Lobby';
import { User } from '../src/domain/entities/User';

describe('Lobby', () => {
  test('should add a user to the lobby and then remove it', (done) => {
    const userId = randomUUID();
    const lobby = new Lobby(randomUUID(), [new User(userId, 'test')]);
    expect(lobby.getUsers().length).toBe(1);
    lobby.removeUser(userId);
    expect(lobby.getUsers().length).toBe(0);
    done();
  });
});