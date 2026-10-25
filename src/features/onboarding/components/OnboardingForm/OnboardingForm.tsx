import { useOnboardingForm } from "../../hooks/useOnboardingForm";
import { OnboardingFormStep1 } from "./OnboardingFormStep1";

interface OnboardingFormProps {
  step: number;
  onStepSuccess?: (step: number) => void;
}

export function OnboardingForm({ step, onStepSuccess }: OnboardingFormProps) {
  const { form, submitStep1, step1SubmitError } = useOnboardingForm({ onStepSuccess });

  return (
    <>
      {step === 0 && (
        <OnboardingFormStep1
          form={form}
          onSubmit={submitStep1}
          submitError={step1SubmitError}
        />
      )}
    </>
  );
}
