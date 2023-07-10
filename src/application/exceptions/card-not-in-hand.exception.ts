class CardNotInHandException extends Error {
  constructor(message?: string) {
    super(message || 'Card not found in players hand.');
    this.name = 'CardNotInHandException';
  }
}

export default CardNotInHandException;