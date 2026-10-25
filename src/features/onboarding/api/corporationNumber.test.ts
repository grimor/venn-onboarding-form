import { describe, expect, it } from "vitest";

import { fetchCorporationNumberValidation } from "./corporationNumber";
import { env } from "../../../shared/config/env";
import { mockFetch } from "../../../test/mockFetch";

describe("fetchCorporationNumberValidation", () => {
  it("returns a valid result", async () => {
    const fetchMock = mockFetch({
      corporationNumber: "826417395",
      valid: true,
    });

    await expect(
      fetchCorporationNumberValidation("826417395"),
    ).resolves.toEqual({ corporationNumber: "826417395", valid: true });
    expect(fetchMock).toHaveBeenCalledWith(
      `${env.apiBaseUrl}/corporation-number/826417395`,
      expect.anything(),
    );
  });

  it("returns an invalid result even for a 404", async () => {
    mockFetch({ valid: false, message: "Invalid corporation number" }, 404);

    await expect(
      fetchCorporationNumberValidation("111111111"),
    ).resolves.toEqual({ valid: false, message: "Invalid corporation number" });
  });

  it("throws when the response shape is unexpected", async () => {
    mockFetch({ unexpected: true });

    await expect(fetchCorporationNumberValidation("123456789")).rejects.toThrow(
      "Unexpected API response",
    );
  });
});
