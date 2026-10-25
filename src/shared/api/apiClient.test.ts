import { describe, expect, it } from "vitest";
import z from "zod";

import { ApiError, apiClient, getApiErrorMessage } from "./apiClient";
import { env } from "../config/env";
import { mockFetch } from "../../test/mockFetch";

describe("apiClient", () => {
  it("GETs a path relative to the base URL and validates the response", async () => {
    const fetchMock = mockFetch({ id: 1 });

    await expect(
      apiClient.get("/things/1", z.object({ id: z.number() })),
    ).resolves.toEqual({ id: 1 });

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe(`${env.apiBaseUrl}/things/1`);
    expect(init?.method).toBe("GET");
    expect(init?.body).toBeUndefined();
  });

  it("POSTs a JSON body", async () => {
    const fetchMock = mockFetch(undefined, 200);

    await expect(
      apiClient.post("/things", { name: "x" }, z.unknown()),
    ).resolves.toBeNull();

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe(`${env.apiBaseUrl}/things`);
    expect(init?.method).toBe("POST");
    expect(init?.body).toBe(JSON.stringify({ name: "x" }));
    expect(init?.headers).toMatchObject({
      "Content-Type": "application/json",
    });
  });

  it("throws ApiError with the server message for non-2xx responses", async () => {
    mockFetch({ message: "Invalid phone number" }, 400);

    const error: unknown = await apiClient
      .post("/things", {}, z.unknown())
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 400,
      message: "Invalid phone number",
    });
    expect(getApiErrorMessage(error, "fallback")).toBe("Invalid phone number");
  });

  it("falls back to a generic message when the server gives none", async () => {
    mockFetch(undefined, 500);

    const error: unknown = await apiClient
      .get("/things", z.unknown())
      .catch((e: unknown) => e);

    expect(error).toMatchObject({ status: 500 });
    expect(getApiErrorMessage(error, "fallback")).toBe("fallback");
  });
});
