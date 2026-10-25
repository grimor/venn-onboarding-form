import { afterEach, describe, expect, it, vi } from "vitest";
import z from "zod";

import { ApiError, apiClient, getApiErrorMessage } from "./apiClient";
import { env } from "../config/env";
import { mockFetch } from "../../test/mockFetch";

describe("apiClient", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

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

  it("aborts the request after a 10 second timeout when no signal is given", async () => {
    const timeoutController = new AbortController();
    const timeoutSpy = vi
      .spyOn(AbortSignal, "timeout")
      .mockReturnValue(timeoutController.signal);
    const fetchMock = mockFetch({});

    await apiClient.post("/things", {}, z.unknown());

    expect(timeoutSpy).toHaveBeenCalledWith(10_000);
    const signal = fetchMock.mock.calls[0]?.[1]?.signal;
    expect(signal?.aborted).toBe(false);

    timeoutController.abort(new DOMException("timed out", "TimeoutError"));

    expect(signal?.aborted).toBe(true);
    expect(signal?.reason).toMatchObject({ name: "TimeoutError" });
  });

  it("aborts the request when the caller's signal aborts", async () => {
    const fetchMock = mockFetch({});
    const controller = new AbortController();

    await apiClient.get("/things", z.unknown(), { signal: controller.signal });

    const signal = fetchMock.mock.calls[0]?.[1]?.signal;
    expect(signal).toBeInstanceOf(AbortSignal);
    expect(signal?.aborted).toBe(false);

    const reason = new Error("cancelled");
    controller.abort(reason);

    expect(signal?.aborted).toBe(true);
    expect(signal?.reason).toBe(reason);
  });

  it("aborts the request after a 10 second timeout", async () => {
    const timeoutController = new AbortController();
    const timeoutSpy = vi
      .spyOn(AbortSignal, "timeout")
      .mockReturnValue(timeoutController.signal);
    const fetchMock = mockFetch({});

    await apiClient.get("/things", z.unknown(), {
      signal: new AbortController().signal,
    });

    expect(timeoutSpy).toHaveBeenCalledWith(10_000);
    const signal = fetchMock.mock.calls[0]?.[1]?.signal;
    expect(signal?.aborted).toBe(false);

    timeoutController.abort(new DOMException("timed out", "TimeoutError"));

    expect(signal?.aborted).toBe(true);
    expect(signal?.reason).toMatchObject({ name: "TimeoutError" });
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
