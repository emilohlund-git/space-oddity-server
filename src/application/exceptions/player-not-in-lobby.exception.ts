class PlayerNotInLobbyException extends Error {
  constructor(message?: string) {
    super(message ?? 'Player does not exist in lobby.');
    this.name = 'PlayerNotInLobbyException';
  }
}

export default PlayerNotInLobbyException;