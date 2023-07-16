class LobbyNotFoundException extends Error {
  constructor(message?: string) {
    super(message ?? 'Lobby not found.');
    this.name = 'LobbyNotFoundException';
  }
}

export default LobbyNotFoundException;