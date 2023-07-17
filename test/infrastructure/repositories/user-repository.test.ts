import { randomUUID } from 'crypto';
import Player from '../../../src/domain/entities/Player';
import { User } from '../../../src/domain/entities/User';
import { UserRepository } from '../../../src/domain/repositories/user-repository.interface';
import { InMemoryUserRepository } from '../../../src/infrastructure/repositories/in-memory-user.repository';

describe('UserRepository', () => {
  let userRepository: UserRepository;

  beforeAll(() => {
    userRepository = new InMemoryUserRepository();
  });

  test('should remove several players at once', () => {
    const player = new Player('1', 'test1');
    const player2 = new Player('2', 'test2');

    userRepository.save(player);
    userRepository.save(player2);

    expect(userRepository.findAll()).toHaveLength(2);

    userRepository.removeMany([player, player2]);

    expect(userRepository.findAll()).toHaveLength(0);
  });

  test('should save many users to the repository', () => {
    expect(userRepository.findAll().length).toBe(0);
    userRepository.saveMany([new Player('1', '1'), new Player('2', '2')]);
    expect(userRepository.findAll().length).toBe(2);
    userRepository.clear();
    expect(userRepository.findAll().length).toBe(0);
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