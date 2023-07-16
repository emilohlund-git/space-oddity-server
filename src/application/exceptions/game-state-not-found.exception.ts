class GameStateNotFoundException extends Error {
  constructor(message?: string) {
    super(message ?? 'Game state not found.');
    this.name = 'GameStateNotFoundException';
  }
}

export default GameStateNotFoundException;