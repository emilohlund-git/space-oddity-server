import { randomUUID } from 'crypto';
import { UserService } from '../../../src/application/services/user.service';
import Hand from '../../../src/domain/entities/Hand';
import Player from '../../../src/domain/entities/Player';
import { UserRepository } from '../../../src/domain/repositories/user-repository.interface';
import { InMemoryUserRepository } from '../../../src/infrastructure/repositories/in-memory-user.repository';

describe('UserService', () => {
  let userRepository: UserRepository;
  let userService: UserService;

  beforeAll(() => {
    userRepository = new InMemoryUserRepository();
    userService = new UserService(userRepository);
  });

  describe('removeMany', () => {
    test('should remove several players at once', () => {
      const player1 = new Player('Player1', new Hand(), randomUUID());
      const player2 = new Player('Player2', new Hand(), randomUUID());

      userService.save(player1);
      userService.save(player2);

      expect(userService.findAll()).toHaveLength(2);

      userService.removeMany([player1, player2]);

      expect(userService.findAll()).toHaveLength(0);
    });
  });

  describe('findByUsername', () => {
    test('Should return undefined, and then the users name', (done) => {
      let user = userService.findByUsername('Player1');

      expect(user?.username).toBe(undefined);

      userService.save(new Player('Player1', new Hand(), randomUUID()));

      user = userService.findByUsername('Player1');

      expect(user?.username).toBe('Player1');

      done();
    });
  });
});