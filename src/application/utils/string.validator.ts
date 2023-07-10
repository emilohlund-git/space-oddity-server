export function isValidString(input: string): boolean {
  return typeof input === 'string' && input.trim() !== '';
}