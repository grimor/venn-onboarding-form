import { useQueryClient } from "@tanstack/react-query";

import { corporationNumberQueryOptions } from "../api/corporationNumber";
import { corporationNumberSchema } from "../model/onboardingSchema";

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
 * - When the user edits the value while a check is in flight, the edited
 *   value is checked instead, so a pending submit never passes a number
 *   that wasn't validated.
 */
export function useCorporationNumberValidator() {
  const queryClient = useQueryClient();

  return ({
    value,
    signal,
    getCurrentValue,
  }: ValidateCorporationNumberParams) => {
    const check = async (checkedValue: string): Promise<string | undefined> => {
      // The edited value hasn't been through the field's sync validator yet.
      const format = corporationNumberSchema.safeParse(checkedValue);
      if (!format.success) return format.error.issues[0]?.message;

      const options = corporationNumberQueryOptions(checkedValue);
      const isSuperseded = () => getCurrentValue() !== checkedValue;

      // Settles a check whose value has since changed. An aborted run is
      // replaced by a newer TanStack run, which reports the result instead.
      const settleStale = () => {
        if (signal.aborted) return undefined;
        return check(getCurrentValue());
      };

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

        if (signal.aborted || isSuperseded()) return await settleStale();
        return result.valid ? undefined : result.message;
      } catch {
        if (signal.aborted || isSuperseded()) return await settleStale();
        return CORPORATION_NUMBER_UNVERIFIED_ERROR;
      } finally {
        signal.removeEventListener("abort", cancelIfSuperseded);
      }
    };

    return check(value);
  };
}
