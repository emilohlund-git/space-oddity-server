class LobbyExistsException extends Error {
  constructor(message?: string) {
    super(message || 'Lobby already exists.');
    this.name = 'LobbyExistsException';
  }
}

export default LobbyExistsException;