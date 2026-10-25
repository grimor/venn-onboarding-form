import { describe, expect, it } from "vitest";

import { ApiError } from "../../../shared/api";
import { submitProfileDetails } from "./profileDetails";
import { env } from "../../../shared/config/env";
import { mockFetch } from "../../../test/mockFetch";

const values = {
  firstName: "Hello",
  lastName: "World",
  corporationNumber: "826417395",
  phone: "+13062776103",
};

describe("submitProfileDetails", () => {
  it("POSTs the profile details and resolves on 200", async () => {
    const fetchMock = mockFetch(undefined, 200);

    await expect(submitProfileDetails(values)).resolves.toBeUndefined();

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe(`${env.apiBaseUrl}/profile-details`);
    expect(init?.method).toBe("POST");
    const body = init?.body;
    expect(typeof body).toBe("string");
    expect(JSON.parse(body as string)).toEqual(values);
  });

  it("throws ApiError with the server message on 400", async () => {
    mockFetch({ message: "Invalid phone number" }, 400);

    const error: unknown = await submitProfileDetails(values).catch(
      (e: unknown) => e,
    );

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 400,
      message: "Invalid phone number",
    });
  });
});
