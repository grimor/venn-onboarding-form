import { onboardingFormOptions } from "../model/onboardingFormOptions";
import type { OnboardingStep1Values } from "../model/onboardingSchema";
import { useAppForm } from "../../../shared/form/useAppForm";

export function useOnboardingForm({
  onStepSuccess,
}: { onStepSuccess?: (step: number) => void } = {}) {
  const form = useAppForm({
    ...onboardingFormOptions,
    onSubmit: ({ value }) => {
      console.log("Submitted: ", value);
    },
  });

  const submitStep1 = (value: OnboardingStep1Values) => {
    console.log("Submitted step 1: ", value);
    onStepSuccess?.(0);
  };

  return { form, submitStep1 };
}
