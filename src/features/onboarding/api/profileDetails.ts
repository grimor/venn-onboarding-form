import { mutationOptions } from "@tanstack/react-query";
import z from "zod";

import { apiClient } from "../../../shared/api";

const profileDetailsRequestSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  corporationNumber: z.string(),
  phone: z.string(),
});

export type ProfileDetailsRequest = z.infer<typeof profileDetailsRequestSchema>;

// The response body isn't used, a 2xx status means the details were accepted.
// A 400 carries `{ message }`, which `apiClient` surfaces via `ApiError`.
const profileDetailsResponseSchema = z.unknown();

export async function submitProfileDetails(
  values: ProfileDetailsRequest,
): Promise<void> {
  const body = profileDetailsRequestSchema.parse(values);
  await apiClient.post("/profile-details", body, profileDetailsResponseSchema);
}

export const profileDetailsMutationOptions = () =>
  mutationOptions({
    mutationKey: ["profile-details"],
    mutationFn: submitProfileDetails,
  });
