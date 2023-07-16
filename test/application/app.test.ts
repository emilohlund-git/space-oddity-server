import { gameScheduler } from '../../src/application/app';

describe('App', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call gameScheduler.unref() on exit', () => {
    const unrefMock = jest.spyOn(gameScheduler, 'unref');

    // Emit the 'exit' event on the process
    process.emit('exit', 0);

    // Assert that gameScheduler.unref() has been called
    expect(unrefMock).toHaveBeenCalled();
  });

  it('should call gameScheduler.unref() and process.exit() on SIGINT', () => {
    const unrefMock = jest.spyOn(gameScheduler, 'unref');
    const exitMock = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit');
    });

    expect(() => {
      process.emit('SIGINT');
    }).toThrow('process.exit');

    expect(unrefMock).toHaveBeenCalled();
    expect(exitMock).toHaveBeenCalled();
  });
});