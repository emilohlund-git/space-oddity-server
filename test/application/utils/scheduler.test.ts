import { startInactiveLobbyCheck } from '../../../src/application/utils/scheduler';

jest.mock('node-cron');

describe('scheduler', () => {
  it('should schedule checkInactiveLobbies every 5 minutes', () => {
    const mockGameManager = {
      checkInactiveLobbies: jest.fn(),
    } as any;
    const scheduleMock = require('node-cron').schedule;

    startInactiveLobbyCheck(mockGameManager);

    expect(scheduleMock).toHaveBeenCalledWith('*/5 * * * *', expect.any(Function));

    // Simulate invoking the scheduled task
    const callback = scheduleMock.mock.calls[0][1];
    callback();

    // Verify that checkInactiveLobbies was called
    expect(mockGameManager.checkInactiveLobbies).toHaveBeenCalled();
  });
});