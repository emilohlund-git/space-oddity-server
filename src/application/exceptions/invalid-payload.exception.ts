class InvalidPayloadException extends Error {
  constructor(message?: string) {
    super(message || 'Invalid payload');
    this.name = 'InvalidPayloadException';
  }
}

export default InvalidPayloadException;