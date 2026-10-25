import { describe, expect, it } from "vitest";

import {
  onboardingStep1Schema,
  type OnboardingStep1Values,
} from "./onboardingSchema";

const validValues: OnboardingStep1Values = {
  firstName: "Hello",
  lastName: "World",
  phone: "+13062776103",
  corporationNumber: "826417395",
};

function getErrors(overrides: Partial<OnboardingStep1Values>) {
  const result = onboardingStep1Schema.safeParse({
    ...validValues,
    ...overrides,
  });
  return result.success ? [] : result.error.issues.map((i) => i.message);
}

describe("onboardingStep1Schema", () => {
  it("accepts valid values", () => {
    expect(getErrors({})).toEqual([]);
  });

  it.each([
    ["firstName", "First name is required"],
    ["lastName", "Last name is required"],
    ["phone", "Phone number is required"],
    ["corporationNumber", "Corporation number is required"],
  ] as const)("requires %s, with only the required message", (field, message) => {
    expect(getErrors({ [field]: "" })).toEqual([message]);
    expect(getErrors({ [field]: "   " })).toEqual([message]);
  });

  it("limits names to 50 characters", () => {
    expect(getErrors({ firstName: "a".repeat(50) })).toEqual([]);
    expect(getErrors({ lastName: "a".repeat(51) })).toEqual([
      "Last name must be at most 50 characters",
    ]);
  });

  it.each(["+447911123456", "13062776103", "+1 306 277 6103", "+1306277610"])(
    "rejects phone number %s",
    (phone) => {
      expect(getErrors({ phone })).toEqual([
        "Phone number must start with +1 followed by 10 digits",
      ]);
    },
  );

  it.each(["12345678", "1234567890", "12345678a"])(
    "rejects corporation number %s",
    (corporationNumber) => {
      expect(getErrors({ corporationNumber })).toEqual([
        "Corporation number must be 9 digits",
      ]);
    },
  );
});
