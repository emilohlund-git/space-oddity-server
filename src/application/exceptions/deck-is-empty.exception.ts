class DeckIsEmptyException extends Error {
  constructor(message?: string) {
    super(message ?? 'The deck contains no cards.');
    this.name = 'DeckIsEmptyException';
  }
}

export default DeckIsEmptyException;