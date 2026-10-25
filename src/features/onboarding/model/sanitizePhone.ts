/**
 * Keep only digits and a single leading "+".
 */
export function sanitizePhone(value: string): string {
  const hasLeadingPlus = value.trimStart().startsWith("+");
  const digits = value.replace(/\D/g, "");

  return hasLeadingPlus ? `+${digits}` : digits;
}
