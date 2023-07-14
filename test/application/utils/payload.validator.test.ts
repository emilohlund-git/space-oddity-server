import { randomUUID } from 'crypto';
import InvalidPayloadException from '../../../src/application/exceptions/invalid-payload.exception';
import { createPayloadValidationRules, validatePayload } from '../../../src/application/utils/payload.validator';
import { isValidString } from '../../../src/application/utils/string.validator';
import { isValidUUID } from '../../../src/application/utils/uuid.validator';

describe('PayloadValidator', () => {
  it('should create validation rules based on the payload shape', () => {
    const payloadShape = {
      userId: '1234',
      lobbyId: randomUUID(),
      name: 'John Doe',
    };

    const expectedRules = {
      userId: isValidString,
      lobbyId: isValidUUID,
      name: isValidString,
    };

    const rules = createPayloadValidationRules(payloadShape);

    expect(rules).toEqual(expectedRules);
  });

  it('should validate payload successfully with valid values', () => {
    const payload = {
      userId: '1234',
      lobbyId: randomUUID(),
      name: 'John Doe',
    };

    const validationRules = {
      userId: isValidString,
      lobbyId: isValidUUID,
      name: isValidString,
    };

    expect(() => {
      validatePayload(payload, validationRules);
    }).not.toThrow(InvalidPayloadException);
  });

  it('should throw InvalidPayloadException with missing or invalid values', () => {
    const payload = {
      userId: '1234',
      lobbyId: '5678',
      name: 1234,
    };

    const validationRules = {
      userId: isValidUUID,
      lobbyId: isValidUUID,
      name: isValidString,
    };

    expect(() => {
      validatePayload(payload, validationRules);
    }).toThrow(InvalidPayloadException);
  });

  it('should return an empty object when the payload shape is empty', () => {
    const payloadShape = {};

    const rules = createPayloadValidationRules(payloadShape);

    expect(rules).toEqual({});
  });
});