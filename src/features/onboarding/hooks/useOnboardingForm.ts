import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { onboardingFormOptions } from "../model/onboardingFormOptions";
import type { OnboardingStep1Values } from "../model/onboardingSchema";
import { profileDetailsMutationOptions } from "../api/profileDetails";
import { useAppForm } from "../../../shared/form/useAppForm";
import { getApiErrorMessage } from "../../../shared/api";

export function useOnboardingForm({
  onStepChange,
}: { onStepChange?: (step: number) => void } = {}) {
  // Hides the submit error once the user edits the form, until the next submit.
  const [isSubmitErrorDismissed, setIsSubmitErrorDismissed] = useState(false);

  const form = useAppForm({
    ...onboardingFormOptions,
    listeners: {
      onChange: () => {
        setIsSubmitErrorDismissed(true);
      },
    },
  });

  const profileDetailsMutation = useMutation({
    ...profileDetailsMutationOptions(),
    onSuccess: () => {
      onStepChange?.(1);
    },
  });

  const submitStep1 = async (value: OnboardingStep1Values) => {
    setIsSubmitErrorDismissed(false);
    try {
      await profileDetailsMutation.mutateAsync(value);
    } catch {
      // Already exposed via `step1SubmitError` below.
    }
  };

  const step1SubmitError =
    profileDetailsMutation.isError && !isSubmitErrorDismissed
      ? getApiErrorMessage(
          profileDetailsMutation.error,
          "Something went wrong. Please try again.",
        )
      : undefined;

  return { form, submitStep1, step1SubmitError };
}
