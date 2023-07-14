import { CardService } from '../../../src/application/services/card.service';
import Card from '../../../src/domain/entities/Card';
import { CardRepository } from '../../../src/domain/repositories/card-repository.interface';
import { InMemoryCardRepository } from '../../../src/infrastructure/repositories/in-memory-card.repository';

describe('CardService', () => {
  let cardRepository: CardRepository;
  let cardService: CardService;

  beforeAll(() => {
    cardRepository = new InMemoryCardRepository();
    cardService = new CardService(cardRepository);
  });

  describe('findAll', () => {
    test('Should return a list of all cards', (done) => {
      let cards = cardService.findAll();

      expect(cards).toHaveLength(0);

      const testCard = new Card(0);

      cardService.save(testCard);

      cards = cardService.findAll();

      expect(cards).toHaveLength(1);

      done();
    });
  });
});