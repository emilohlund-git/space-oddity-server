import cron from 'cron';
import { startInactiveLobbyCheck } from '../../../src/application/utils/scheduler';

const schedulerMock = jest.fn();

jest.mock('cron', () => ({
  schedule: (...args: any[]) => schedulerMock(...args),
}));

describe('scheduler', () => {
  afterEach(() => {
    // Stop the cron job and clear any timers
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  it('should schedule checkInactiveLobbies every 5 minutes', () => {
    const mockGameManager = {
      checkInactiveLobbies: jest.fn(),
    } as any;
    const jobMock = jest.fn();
    cron.job = jest.fn().mockImplementation((cronExpression, callback) => {
      jobMock(cronExpression, callback); // Call the mock implementation
      return {}; // Return an empty object as a placeholder for the scheduled task
    });

    startInactiveLobbyCheck(mockGameManager);

    expect(cron.job).toHaveBeenCalledWith('*/5 * * * *', expect.any(Function), null, true);

    // Simulate invoking the scheduled task
    expect(jobMock).toHaveBeenCalled();

    // Simulate invoking the scheduled task
    const callback = jobMock.mock.calls[0][1];
    callback();

    // Verify that checkInactiveLobbies was called
    expect(mockGameManager.checkInactiveLobbies).toHaveBeenCalled();
  });
});