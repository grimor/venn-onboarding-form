import type { StandardSchemaV1Issue } from "@tanstack/react-form";

/**
 * Check if error is Tanstack Form issue format
 */
function isIssue(error: unknown): error is StandardSchemaV1Issue {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  );
}

/**
 * Normalize field errors them to unique, displayable messages.
 */
export function getErrorMessages(errors: readonly unknown[]): string[] {
  const messages = errors.flatMap((error) => {
    if (typeof error === "string") return [error];
    if (isIssue(error)) return [error.message];
    return [];
  });

  return [...new Set(messages)];
}
