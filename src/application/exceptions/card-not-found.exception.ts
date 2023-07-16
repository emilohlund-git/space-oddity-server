class CardNotFoundException extends Error {
  constructor(message?: string) {
    super(message ?? 'Card not found.');
    this.name = 'CardNotFoundException';
  }
}

export default CardNotFoundException;