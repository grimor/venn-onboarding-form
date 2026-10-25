/**
 * Keep only digits.
 */
export function sanitizeCorporationNumber(value: string): string {
  return value.replace(/\D/g, "");
}
