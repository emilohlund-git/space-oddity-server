import { UUID, randomUUID } from 'crypto';
import Card from './Card';

class Table {
  public id: UUID = randomUUID();

  private disposedCards: Card[];

  constructor() {
    this.disposedCards = [];
  }

  public getDisposedCards(): Card[] {
    return this.disposedCards;
  }

  public disposeCard(card: Card): void {
    this.disposedCards.push(card);
  }

  public clearTable(): void {
    this.disposedCards = [];
  }
}

export default Table;