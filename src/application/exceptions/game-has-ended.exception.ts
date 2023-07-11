class GameHasNotEndedException extends Error {
  constructor(message?: string) {
    super(message || 'Game has not ended.');
    this.name = 'GameHasEndedException';
  }
}

export default GameHasNotEndedException;