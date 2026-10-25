import { queryOptions } from "@tanstack/react-query";
import z from "zod";

import { ApiError, apiClient } from "../../../shared/api";

const corporationNumberResponseSchema = z.discriminatedUnion("valid", [
  z.object({ valid: z.literal(true), corporationNumber: z.string() }),
  z.object({ valid: z.literal(false), message: z.string() }),
]);

export type CorporationNumberValidation = z.infer<
  typeof corporationNumberResponseSchema
>;

export async function fetchCorporationNumberValidation(
  corporationNumber: string,
  signal?: AbortSignal,
): Promise<CorporationNumberValidation> {
  try {
    return await apiClient.get(
      `/corporation-number/${encodeURIComponent(corporationNumber)}`,
      corporationNumberResponseSchema,
      { signal },
    );
  } catch (error) {
    // An invalid number comes back as 404 with a `{ valid: false }` body.
    if (error instanceof ApiError) {
      const parsed = corporationNumberResponseSchema.safeParse(error.body);
      if (parsed.success) return parsed.data;
    }
    throw error;
  }
}

export const corporationNumberQueryOptions = (corporationNumber: string) =>
  queryOptions({
    queryKey: ["corporation-number", corporationNumber],
    queryFn: ({ signal }) =>
      fetchCorporationNumberValidation(corporationNumber, signal),
    // Validity of a given number doesn't change while the user fills the form.
    staleTime: 5 * 60 * 1000,
  });
