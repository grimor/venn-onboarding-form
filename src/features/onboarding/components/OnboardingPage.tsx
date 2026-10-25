import { useState } from "react";

import { Card } from "../../../shared/ui/Card";
import { Text } from "../../../shared/ui/Text";
import { ONBOARDING_STEPS_COUNT } from "../model/onboardingFormOptions";
import { OnboardingForm } from "./OnboardingForm/OnboardingForm";

import styles from "./OnboardingPage.module.css";

export function OnboardingPage() {
  const [step, setStep] = useState(0);

  const handleStepSuccess = (submittedStep: number) => {
    setStep(Math.min(submittedStep + 1, ONBOARDING_STEPS_COUNT - 1));
  };

  return (
    <div className={styles.Page}>
      <div className={styles.Heading}>
        <Text size="xl" weight="medium">
          Step {step + 1} of {ONBOARDING_STEPS_COUNT}
        </Text>
      </div>
      <div className={styles.ContentWrapper}>
        <Card.Root>
          <Card.Header>
            <Text size="lg">Onboarding Form</Text>
          </Card.Header>
          <Card.Content className={styles.FormCardContent}>
            <OnboardingForm step={step} onStepSuccess={handleStepSuccess} />
          </Card.Content>
        </Card.Root>
      </div>
    </div>
  );
}
