import { describe, expect, it } from "vitest";

import { sanitizeCorporationNumber } from "./sanitizeCorporationNumber";

describe("sanitizeCorporationNumber", () => {
  it("keeps digits", () => {
    expect(sanitizeCorporationNumber("826417395")).toBe("826417395");
    expect(sanitizeCorporationNumber("012345678")).toBe("012345678");
  });

  it("strips letters, spaces and special characters", () => {
    expect(sanitizeCorporationNumber("826 417 395")).toBe("826417395");
    expect(sanitizeCorporationNumber("+8a2-6.4#1")).toBe("82641");
  });

  it("returns an empty string for input without digits", () => {
    expect(sanitizeCorporationNumber("abc-()")).toBe("");
  });
});
