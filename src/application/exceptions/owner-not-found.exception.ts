class OwnerNotFoundException extends Error {
  constructor(message?: string) {
    super(message || 'Owner not found.');
    this.name = 'OwnerNotFoundException';
  }
}

export default OwnerNotFoundException;