class InsufficientCardsException extends Error {
  constructor(message?: string) {
    super(message || 'Insufficient cards in the deck.');
    this.name = 'InsufficientCardsException';
  }
}

export default InsufficientCardsException;