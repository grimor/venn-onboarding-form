import { describe, expect, it } from "vitest";

import { sanitizePhone } from "./sanitizePhone";

describe("sanitizePhone", () => {
  it("keeps digits and a leading +", () => {
    expect(sanitizePhone("+13062776103")).toBe("+13062776103");
    expect(sanitizePhone("13062776103")).toBe("13062776103");
  });

  it("strips special characters and letters", () => {
    expect(sanitizePhone("+1 (306) 277-6103")).toBe("+13062776103");
    expect(sanitizePhone("+1a.b#306")).toBe("+1306");
  });

  it("drops + anywhere except the beginning", () => {
    expect(sanitizePhone("1+306")).toBe("1306");
    expect(sanitizePhone("++1306+")).toBe("+1306");
  });

  it("returns an empty string for input without digits or leading +", () => {
    expect(sanitizePhone("abc-()")).toBe("");
  });
});
