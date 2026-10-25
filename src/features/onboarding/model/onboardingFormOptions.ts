import { formOptions } from "@tanstack/react-form";
import type { OnboardingValues } from "./onboardingSchema";

export const ONBOARDING_STEPS_COUNT = 5;

export const onboardingDefaultValues: OnboardingValues = {
  step1: {
    firstName: "",
    lastName: "",
    phone: "",
    corporationNumber: "",
  },
};

export const onboardingFormOptions = formOptions({
  defaultValues: onboardingDefaultValues,
});
