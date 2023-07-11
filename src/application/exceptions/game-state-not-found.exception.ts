class GameStateFoundException extends Error {
  constructor(message?: string) {
    super(message || 'Game state not found.');
    this.name = 'GameStateFoundException';
  }
}

export default GameStateFoundException;