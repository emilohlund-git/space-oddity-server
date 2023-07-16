import { startInactiveLobbyCheck } from '../../../src/application/utils/scheduler';

jest.useFakeTimers();

describe('scheduler', () => {
  afterEach((done) => {
    jest.clearAllTimers();
    jest.clearAllMocks();
    done();
  });

  describe('startInactiveLobbyCheck', () => {
    let mockGameManager: any;

    beforeEach(() => {
      mockGameManager = {
        checkInactiveLobbies: jest.fn(),
      };
    });

    afterEach(() => {
      jest.clearAllTimers();
      jest.clearAllMocks();
    });

    it('should call checkInactiveLobbies every 5 minutes', () => {
      startInactiveLobbyCheck(mockGameManager);

      jest.advanceTimersByTime(5 * 60 * 1000);

      expect(mockGameManager.checkInactiveLobbies).toHaveBeenCalled();
    });
  });
});