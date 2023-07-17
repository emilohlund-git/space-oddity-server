class FailedToRetrieveGameStateException extends Error {
  constructor(message?: string) {
    super(message ?? 'Could not retrieve game state.');
    this.name = 'FailedToRetrieveGameStateException';
  }
}

export default FailedToRetrieveGameStateException;