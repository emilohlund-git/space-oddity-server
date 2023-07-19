class FailedToSaveGameStateException extends Error {
  constructor(message?: string) {
    super(message ?? 'Could not retrieve game state.');
    this.name = 'FailedToSaveGameStateException';
  }
}

export default FailedToSaveGameStateException;