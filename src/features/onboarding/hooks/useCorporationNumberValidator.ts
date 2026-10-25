import { useQueryClient } from "@tanstack/react-query";

import { corporationNumberQueryOptions } from "../api/corporationNumber";

export const CORPORATION_NUMBER_UNVERIFIED_ERROR =
  "We couldn't verify the corporation number. Please try again.";

interface ValidateCorporationNumberParams {
  value: string;
  signal: AbortSignal;
  getCurrentValue: () => string;
}

/**
 * Async field validator that checks a corporation number against the API.
 *
 * - Requests go through the query cache, so re-validating the same number
 *   (blur followed by submit, re-typing a previous value) is deduplicated.
 * - When TanStack Form supersedes a run with a different value, the in-flight
 *   request is cancelled.
 * - Results for a value the user has since edited are dropped.
 */
export function useCorporationNumberValidator() {
  const queryClient = useQueryClient();

  return async ({
    value,
    signal,
    getCurrentValue,
  }: ValidateCorporationNumberParams) => {
    const options = corporationNumberQueryOptions(value);
    const isSuperseded = () => getCurrentValue() !== value;
    const isStale = () => signal.aborted || isSuperseded();

    const cancelIfSuperseded = () => {
      if (!isSuperseded()) return;
      void queryClient.cancelQueries({
        queryKey: options.queryKey,
        exact: true,
      });
    };
    signal.addEventListener("abort", cancelIfSuperseded, { once: true });

    try {
      const result = await queryClient.query(options);

      if (isStale()) return undefined;
      return result.valid ? undefined : result.message;
    } catch {
      if (isStale()) return undefined;
      return CORPORATION_NUMBER_UNVERIFIED_ERROR;
    } finally {
      signal.removeEventListener("abort", cancelIfSuperseded);
    }
  };
}
