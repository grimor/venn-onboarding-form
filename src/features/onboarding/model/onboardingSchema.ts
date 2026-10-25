import z from "zod";

const NAME_MAX_LENGTH = 50;

// Trims before the checks, so the limits apply to what gets submitted.
// Field validators only read the issues, so the submitted payload must be
// parsed through the schema to get the trimmed output.
const requiredString = (label: string) =>
  z.string().trim().refine((value) => value !== "", {
    error: `${label} is required`,
    // Skip format checks on an empty value, so only "required" is shown.
    abort: true,
  });

const name = (label: string) =>
  requiredString(label).max(NAME_MAX_LENGTH, {
    error: `${label} must be at most ${String(NAME_MAX_LENGTH)} characters`,
  });

export const onboardingStep1Schema = z.object({
  firstName: name("First name"),
  lastName: name("Last name"),
  // Only the Canadian country code is checked here, the full number is
  // validated by the API on submit.
  // If better client validation is needed, should use `libphonenumber-js`
  // library for best accuracy. Reason for not doing that, it would
  // increase bundle size significantly.
  phone: requiredString("Phone number").regex(/^\+1\d{10}$/, {
    error: "Phone number must start with +1 followed by 10 digits",
  }),
  corporationNumber: requiredString("Corporation number").regex(/^\d{9}$/, {
    error: "Corporation number must be 9 digits",
  }),
});

export const onboardingSchema = z.object({
  step1: onboardingStep1Schema,
});

export type OnboardingStep1Values = z.infer<typeof onboardingStep1Schema>;
export type OnboardingValues = z.infer<typeof onboardingSchema>;
