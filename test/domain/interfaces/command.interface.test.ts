import { createPayloadValidationRules, validatePayload } from '../../../src/application/utils/payload.validator';
import { Command } from '../../../src/domain/interfaces/command.interface';

jest.mock('../../../src/application/utils/payload.validator');

class MockCommand extends Command {
  constructor(private readonly payload: any) {
    super(payload);
  }

  execute(): void { }
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
    const command = new MockCommand(payload);

    expect(command).toBeDefined();
    expect(createPayloadValidationRules).toHaveBeenCalledWith(payload);
    expect(validatePayload).toHaveBeenCalledWith(payload, payloadValidationRules);
  });

  it('should have an execute method', () => {
    const command = new MockCommand(payload);

    expect(command.execute).toBeDefined();
  });
});
