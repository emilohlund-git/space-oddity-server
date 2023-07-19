import { Server, Socket } from 'socket.io';
import { createPayloadValidationRules, validatePayload } from '../../../src/application/utils/payload.validator';
import { Command } from '../../../src/domain/interfaces/command.interface';
import { mockGameService } from '../../utils/game-service.mock';

jest.mock('../../../src/application/utils/payload.validator');

class MockCommand extends Command {
  execute(): void {
    throw new Error('Test');
  }
}

describe('Command', () => {
  const payload = { /* mock payload */ };
  const payloadValidationRules = { /* mock validation rules */ };

  beforeEach(() => {
    (createPayloadValidationRules as jest.Mock).mockReturnValue(payloadValidationRules);
    (validatePayload as jest.Mock).mockImplementation(() => {
      // Validation logic
    });
  });

  it('should validate the payload during construction', () => {
    const command = new MockCommand(mockGameService().mockedGameService, {} as Server, {} as Socket, {});

    expect(command).toBeDefined();
    expect(createPayloadValidationRules).toHaveBeenCalledWith(payload);
    expect(validatePayload).toHaveBeenCalledWith(payload, payloadValidationRules);
  });

  it('should have thrown an error on execute', () => {
    const command = new MockCommand(mockGameService().mockedGameService, {} as Server, {} as Socket, {});

    expect(() => command.execute()).toThrow(Error);
  });

  it('should have an execute method', () => {
    const command = new MockCommand(mockGameService().mockedGameService, {} as Server, {} as Socket, {});

    expect(command.execute).toBeDefined();
  });
});
