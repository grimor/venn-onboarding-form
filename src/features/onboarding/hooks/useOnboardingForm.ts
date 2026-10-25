import { useMutation } from "@tanstack/react-query";

import { onboardingFormOptions } from "../model/onboardingFormOptions";
import {
  onboardingStep1Schema,
  type OnboardingStep1Values,
} from "../model/onboardingSchema";
import { profileDetailsMutationOptions } from "../api/profileDetails";
import { useAppForm } from "../../../shared/form/useAppForm";
import { getApiErrorMessage } from "../../../shared/api";

export function useOnboardingForm({
  onStepChange,
}: { onStepChange?: (step: number) => void } = {}) {
  const form = useAppForm({
    ...onboardingFormOptions,
  });

  const profileDetailsMutation = useMutation({
    ...profileDetailsMutationOptions(),
    onSuccess: () => {
      onStepChange?.(1);
    },
  });

  const submitStep1 = async (value: OnboardingStep1Values) => {
    try {
      await profileDetailsMutation.mutateAsync(
        onboardingStep1Schema.parse(value),
      );
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
