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
      const player = new Player('1', 'test1');
      const player2 = new Player('2', 'test2');

      userService.save(player);
      userService.save(player2);

      expect(userService.findAll()).toHaveLength(2);

      userService.removeMany([player, player2]);

      expect(userService.findAll()).toHaveLength(0);
    });
  });

  describe('findByUsername', () => {
    test('Should return undefined, and then the users name', (done) => {
      let user = userService.findByUsername('test');

      expect(user?.username).toBe(undefined);

      userService.save(new Player(randomUUID(), 'test', new Hand()));

      user = userService.findByUsername('test');

      expect(user?.username).toBe('test');

      done();
    });
  });
});