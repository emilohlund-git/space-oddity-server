import InvalidPayloadException from '../exceptions/invalid-payload.exception';
import { isValidString } from './string.validator';
import { isValidUUID } from './uuid.validator';

export function validatePayload(payload: Record<string, any>, validationRules: Record<string, (value: any) => boolean>): void {
  for (const [key, validationFn] of Object.entries(validationRules)) {
    if (!validationFn(payload[key])) {
      throw new InvalidPayloadException(`Invalid payload: ${key} is invalid or missing.`);
    }
  }
}

type ValidationRule = (value: any) => boolean;
type PayloadShape = Record<string, any>;

export function createPayloadValidationRules(payloadShape: PayloadShape): Record<string, ValidationRule> {
  return Object.entries(payloadShape).reduce((rules, [key, value]) => {
    let validationFunction: ValidationRule | undefined;

    if (key.endsWith('Id') && !key.toLowerCase().includes('user')) {
      validationFunction = isValidUUID;
    } else if (typeof value === 'string') {
      validationFunction = isValidString;
    }

    if (validationFunction) {
      return { ...rules, [key]: validationFunction };
    }

    return rules;
  }, {} as Record<string, (value: any) => boolean>);
}
