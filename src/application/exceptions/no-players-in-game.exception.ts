class NoPlayersInGameException extends Error {
  constructor(message?: string) {
    super(message || 'Lobby is empty.');
    this.name = 'NoPlayersInGameException';
  }
}

export default NoPlayersInGameException;