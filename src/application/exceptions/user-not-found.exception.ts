class UserNotFoundException extends Error {
  constructor(message?: string) {
    super(message || 'User not found.');
    this.name = 'UserNotFoundException';
  }
}

export default UserNotFoundException;