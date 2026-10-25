import { mutationOptions } from "@tanstack/react-query";
import z from "zod";

import { apiClient } from "../../../shared/api";
import {
  onboardingStep1Schema,
  type OnboardingStep1Values,
} from "../model/onboardingSchema";

// The request carries the step 1 values.
export type ProfileDetailsRequest = OnboardingStep1Values;

// The response body isn't used, a 2xx status means the details were accepted.
// A 400 carries `{ message }`, which `apiClient` surfaces via `ApiError`.
const profileDetailsResponseSchema = z.unknown();

export async function submitProfileDetails(
  values: ProfileDetailsRequest,
): Promise<void> {
  // Parsing through the step 1 schema also normalizes the values (e.g. trims
  // names), so they're sent as they were validated.
  const body = onboardingStep1Schema.parse(values);
  await apiClient.post("/profile-details", body, profileDetailsResponseSchema);
}

export const profileDetailsMutationOptions = () =>
  mutationOptions({
    mutationKey: ["profile-details"],
    mutationFn: submitProfileDetails,
  });
