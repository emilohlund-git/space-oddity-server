import FailedToRemoveGameStateException from '../../../src/application/exceptions/failed-to-remove-game-state.exception';
import GameNotInProgressException from '../../../src/application/exceptions/game-not-in-progress.exception';
import InvalidPayloadException from '../../../src/application/exceptions/invalid-payload.exception';
import NotYourTurnException from '../../../src/application/exceptions/not-your-turn.exception';

describe('Exceptions', () => {
  describe('InvalidPayloadException', () => {
    test('should throw default exception message', () => {
      const mockMethod = () => { throw new InvalidPayloadException(); };
      expect(mockMethod).toThrowError('Invalid payload');
    });

    test('should throw custom exception message', () => {
      const mockMethod = () => { throw new NotYourTurnException('Test'); };
      expect(mockMethod).toThrowError('Test');
    });
  });

  describe('NotYourTurnException', () => {
    test('should throw default exception message', () => {
      const mockMethod = () => { throw new NotYourTurnException(); };
      expect(mockMethod).toThrowError('Cannot change turn: It is not your turn.');
    });

    test('should throw custom exception message', () => {
      const mockMethod = () => { throw new NotYourTurnException('Test'); };
      expect(mockMethod).toThrowError('Test');
    });
  });

  describe('GameNotInProgressException', () => {
    test('should throw default exception message', () => {
      const mockMethod = () => { throw new GameNotInProgressException(); };
      expect(mockMethod).toThrowError('Game is not in progress.');
    });

    test('should throw custom exception message', () => {
      const mockMethod = () => { throw new GameNotInProgressException('Test'); };
      expect(mockMethod).toThrowError('Test');
    });
  });

  describe('FailedToRemoveGameException', () => {
    test('should throw default exception message', () => {
      const mockMethod = () => { throw new FailedToRemoveGameStateException(); };
      expect(mockMethod).toThrowError('Could not retrieve game state.');
    });

    test('should throw custom exception message', () => {
      const mockMethod = () => { throw new FailedToRemoveGameStateException('Test'); };
      expect(mockMethod).toThrowError('Test');
    });
  });
});