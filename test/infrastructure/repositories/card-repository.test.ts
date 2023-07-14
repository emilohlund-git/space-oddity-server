import { randomUUID } from 'crypto';
import { UserService } from '../../../src/application/services/user.service';
import Card from '../../../src/domain/entities/Card';
import Hand from '../../../src/domain/entities/Hand';
import Player from '../../../src/domain/entities/Player';
import { CardRepository } from '../../../src/domain/repositories/card-repository.interface';
import { UserRepository } from '../../../src/domain/repositories/user-repository.interface';
import { InMemoryCardRepository } from '../../../src/infrastructure/repositories/in-memory-card.repository';
import { InMemoryUserRepository } from '../../../src/infrastructure/repositories/in-memory-user.repository';

describe('CardRepository', () => {
  let cardRepository: CardRepository;
  let userRepository: UserRepository;
  let userService: UserService;

  beforeAll(() => {
    userRepository = new InMemoryUserRepository();
    userService = new UserService(userRepository);
    cardRepository = new InMemoryCardRepository();

    userService.save(new Player(randomUUID(), 'test', new Hand()));
  });

  test('should add a card to the repository and then clear', (done) => {
    expect(cardRepository.findAll().length).toBe(0);
    const card = new Card(0);
    cardRepository.save(card);
    expect(cardRepository.findAll().length).toBe(1);
    cardRepository.removeMany([card]);
    expect(cardRepository.findAll().length).toBe(0);
    cardRepository.save(card);
    expect(cardRepository.findAll().length).toBe(1);
    cardRepository.clear();
    expect(cardRepository.findAll().length).toBe(0);
    done();
  });

  test('should find a card by id', (done) => {
    let card = new Card(0);
    cardRepository.save(card);
    expect(cardRepository.findById(card.id)).toBeDefined();
    done();
  });

  test('should find a card by player', (done) => {
    const testUser = userService.findByUsername('test');
    const testCard = new Card(0);
    cardRepository.save(testCard);

    expect(cardRepository.findByPlayer(testUser!)).toStrictEqual(testUser!.getHand().getCards());

    done();
  });
});