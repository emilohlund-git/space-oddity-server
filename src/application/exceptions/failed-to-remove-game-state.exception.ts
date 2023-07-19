class FailedToRemoveGameStateException extends Error {
  constructor(message?: string) {
    super(message ?? 'Could not retrieve game state.');
    this.name = 'FailedToRemoveGameStateException';
  }
}

export default FailedToRemoveGameStateException;