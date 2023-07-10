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