class NotYourTurnException extends Error {
  constructor(message?: string) {
    super(message || 'Cannot change turn: It is not your turn.');
    this.name = 'NotYourTurnException';
  }
}

export default NotYourTurnException;