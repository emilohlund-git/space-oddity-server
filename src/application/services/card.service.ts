import Card from '../../domain/entities/Card';
import { CardRepository } from '../../domain/repositories/card-repository.interface';

export class CardService {
  private cardRepository: CardRepository;

  constructor(cardRepository: CardRepository) {
    this.cardRepository = cardRepository;
  }

  save(card: Card): void {
    this.cardRepository.save(card);
  }

  findById(cardId: string) {
    return this.cardRepository.findById(cardId);
  }

  findAll(): Card[] {
    return this.cardRepository.findAll();
  }
}