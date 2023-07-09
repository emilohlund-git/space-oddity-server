class FailedUserConnectionException extends Error {
  constructor(message?: string) {
    super(message || 'Failed to connect user.');
    this.name = 'FailedUserConnectionException';
  }
}

export default FailedUserConnectionException;