import z from "zod";

export const onboardingStep1Schema = z.object({
  firstName: z.string().max(50, { error: "Max 50 characters" }),
  lastName: z.string().max(50, { error: "Max 50 characters" }),
  phone: z.e164(),
  corporationNumber: z.string().regex(/^\d{9}$/, {
    error: "Corporation number must be 9 digits",
  }),
});

export const onboardingSchema = z.object({
  step1: onboardingStep1Schema,
});

export type OnboardingStep1Values = z.infer<typeof onboardingStep1Schema>;
export type OnboardingValues = z.infer<typeof onboardingSchema>;
