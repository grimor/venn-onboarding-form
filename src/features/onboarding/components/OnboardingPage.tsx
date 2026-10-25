import { useState } from "react";

import { Card } from "../../../shared/ui/Card";
import { Text } from "../../../shared/ui/Text";
import { ONBOARDING_STEPS_COUNT } from "../model/onboardingFormOptions";
import { OnboardingForm } from "./OnboardingForm/OnboardingForm";

import styles from "./OnboardingPage.module.css";

export function OnboardingPage() {
  const [step, setStep] = useState(0);

  const handleStepChange = (submittedStep: number) => {
    setStep(submittedStep);
  };

  return (
    <div className={styles.Page}>
      <div className={styles.Heading}>
        <Text size="lg" weight="medium">
          Step {step + 1} of {ONBOARDING_STEPS_COUNT}
        </Text>
      </div>
      <div className={styles.ContentWrapper}>
        <Card.Root>
          <Card.Header>
            <Text size="xl">Onboarding Form</Text>
          </Card.Header>
          <Card.Content className={styles.FormCardContent}>
            <OnboardingForm step={step} onStepChange={handleStepChange} />
          </Card.Content>
        </Card.Root>
      </div>
    </div>
  );
}
