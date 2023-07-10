import { randomUUID } from 'crypto';
import { User } from '../../../src/domain/entities/User';
import { UserRepository } from '../../../src/domain/repositories/user-repository.interface';
import { InMemoryUserRepository } from '../../../src/infrastructure/repositories/in-memory-user.repository';

describe('UserRepository', () => {
  let userRepository: UserRepository;

  beforeAll(() => {
    userRepository = new InMemoryUserRepository();
  });

  test('should add a user to the repository and then clear', (done) => {
    expect(userRepository.findAll().length).toBe(0);
    const user = new User(randomUUID(), 'test');
    userRepository.save(user);
    expect(userRepository.findAll().length).toBe(1);
    userRepository.clear();
    expect(userRepository.findAll().length).toBe(0);
    done();
  });

  test('should find a user by username and id', (done) => {
    let user = new User(randomUUID(), 'test');
    userRepository.save(user);
    expect(userRepository.findById(user.id)).toBeDefined();
    expect(userRepository.findByUsername(user.username)).toBeDefined();
    done();
  });

  test('should return undefined if username does not exist', (done) => {
    let username = userRepository.findByUsername('non-existing-username');
    expect(username).toBeUndefined();
    done();
  });
});