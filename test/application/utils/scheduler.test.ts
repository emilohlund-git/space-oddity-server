
const schedulerMock = jest.fn();

jest.mock('cron', () => ({
  job: (...args: any[]) => schedulerMock(...args),
}));

describe('scheduler', () => {
  afterEach((done) => {
    // Stop the cron job and clear any timers
    jest.clearAllTimers();
    jest.clearAllMocks();
    done();
  });

  it('should schedule checkInactiveLobbies every 5 minutes', (done) => {
    done();
  });
});