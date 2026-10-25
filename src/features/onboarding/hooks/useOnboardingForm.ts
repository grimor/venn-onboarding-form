import { useMutation } from "@tanstack/react-query";

import { onboardingFormOptions } from "../model/onboardingFormOptions";
import type { OnboardingStep1Values } from "../model/onboardingSchema";
import { profileDetailsMutationOptions } from "../api/profileDetails";
import { useAppForm } from "../../../shared/form/useAppForm";
import { getApiErrorMessage } from "../../../shared/api";

export function useOnboardingForm({
  onStepSuccess,
}: { onStepSuccess?: (step: number) => void } = {}) {
  const form = useAppForm({
    ...onboardingFormOptions,
    onSubmit: ({ value }) => {
      console.log("Submitted: ", value);
    },
  });

  const profileDetailsMutation = useMutation({
    ...profileDetailsMutationOptions(),
    onSuccess: () => {
      onStepSuccess?.(0);
    },
  });

  const submitStep1 = async (value: OnboardingStep1Values) => {
    try {
      await profileDetailsMutation.mutateAsync(value);
    } catch {
      // Already exposed via `step1SubmitError` below.
    }
  };

  const step1SubmitError = profileDetailsMutation.isError
    ? getApiErrorMessage(
        profileDetailsMutation.error,
        "Something went wrong. Please try again.",
      )
    : undefined;

  return { form, submitStep1, step1SubmitError };
}
