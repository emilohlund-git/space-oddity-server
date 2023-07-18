import { randomUUID } from 'crypto';
import Hand from '../../../src/domain/entities/Hand';
import Player from '../../../src/domain/entities/Player';
import { UserRepository } from '../../../src/domain/repositories/user-repository.interface';
import { InMemoryUserRepository } from '../../../src/infrastructure/repositories/in-memory-user.repository';

describe('UserRepository', () => {
  let userRepository: UserRepository;

  beforeAll(() => {
    userRepository = new InMemoryUserRepository();
  });

  test('should remove several players at once', () => {
    const player1 = new Player('Player1', new Hand(), randomUUID());
    const player2 = new Player('Player2', new Hand(), randomUUID());

    userRepository.save(player1);
    userRepository.save(player2);

    expect(userRepository.findAll()).toHaveLength(2);

    userRepository.removeMany([player1, player2]);

    expect(userRepository.findAll()).toHaveLength(0);
  });

  test('should save many users to the repository', () => {
    const player1 = new Player('Player1', new Hand(), randomUUID());
    const player2 = new Player('Player2', new Hand(), randomUUID());

    expect(userRepository.findAll().length).toBe(0);
    userRepository.saveMany([player1, player2]);
    expect(userRepository.findAll().length).toBe(2);
    userRepository.clear();
    expect(userRepository.findAll().length).toBe(0);
  });

  test('should add a user to the repository and then clear', (done) => {
    expect(userRepository.findAll().length).toBe(0);
    const player1 = new Player('Player1', new Hand(), randomUUID());
    userRepository.save(player1);
    expect(userRepository.findAll().length).toBe(1);
    userRepository.clear();
    expect(userRepository.findAll().length).toBe(0);
    done();
  });

  test('should find a user by username and id', (done) => {
    const player1 = new Player('Player1', new Hand(), randomUUID());
    userRepository.save(player1);
    expect(userRepository.findById(player1.id)).toBeDefined();
    expect(userRepository.findByUsername(player1.username)).toBeDefined();
    done();
  });

  test('should return undefined if username does not exist', (done) => {
    let username = userRepository.findByUsername('non-existing-username');
    expect(username).toBeUndefined();
    done();
  });
});