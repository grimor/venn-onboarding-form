import { Button } from "../../../../shared/ui/Button";
import { useOnboardingForm } from "../../hooks/useOnboardingForm";
import { OnboardingFormStep1 } from "./OnboardingFormStep1";

interface OnboardingFormProps {
  step: number;
  onStepChange?: (step: number) => void;
}

export function OnboardingForm({ step, onStepChange }: OnboardingFormProps) {
  const { form, submitStep1, step1SubmitError } = useOnboardingForm({
    onStepChange,
  });

  return (
    <>
      {step === 0 && (
        <OnboardingFormStep1
          form={form}
          onSubmit={submitStep1}
          submitError={step1SubmitError}
        />
      )}
      {step === 1 && (
        <Button
          onClick={() => {
            onStepChange?.(0);
          }}
        >
          Go Back
        </Button>
      )}
    </>
  );
}
