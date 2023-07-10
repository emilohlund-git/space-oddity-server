import { randomUUID } from 'crypto';
import { UserService } from '../../../src/application/services/user.service';
import { User } from '../../../src/domain/entities/User';
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

      userService.save(new User(randomUUID(), 'test'));

      user = userService.findByUsername('test');

      expect(user?.username).toBe('test');

      done();
    });
  });
});