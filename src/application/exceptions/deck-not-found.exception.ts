class DeckNotFoundException extends Error {
  constructor(message?: string) {
    super(message || 'Deck not found.');
    this.name = 'DeckNotFoundException';
  }
}

export default DeckNotFoundException;