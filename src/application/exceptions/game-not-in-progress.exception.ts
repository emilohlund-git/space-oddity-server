class GameNotInProgressException extends Error {
  constructor(message?: string) {
    super(message || 'Game is not in progress.');
    this.name = 'GameNotInProgressException';
  }
}

export default GameNotInProgressException;