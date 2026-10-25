// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { describe, expect, it, vi } from "vitest";

import {
  CORPORATION_NUMBER_UNVERIFIED_ERROR,
  useCorporationNumberValidator,
} from "./useCorporationNumberValidator";
import { jsonResponse, mockFetch } from "../../../test/mockFetch";

const VALID_NUMBER = "826417395";
const INVALID_NUMBER = "111111111";

function renderValidator() {
  const queryClient = new QueryClient();
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(() => useCorporationNumberValidator(), { wrapper }).result
    .current;
}

/** Stubs `fetch` with a request that stays pending until `respond` is called. */
function mockPendingFetch() {
  let respond: ((response: Response) => void) | undefined;
  const fetchMock = vi.fn<typeof fetch>(
    (_input, init) =>
      new Promise((resolve, reject) => {
        respond = resolve;
        init?.signal?.addEventListener("abort", () => {
          reject(new DOMException("Aborted", "AbortError"));
        });
      }),
  );
  vi.stubGlobal("fetch", fetchMock);

  return {
    fetchMock,
    respond: (body: unknown, status?: number) => {
      respond?.(jsonResponse(body, status));
    },
  };
}

function validate(
  validator: ReturnType<typeof renderValidator>,
  value: string,
  {
    signal = new AbortController().signal,
    getCurrentValue = () => value,
  }: { signal?: AbortSignal; getCurrentValue?: () => string } = {},
) {
  return validator({ value, signal, getCurrentValue });
}

describe("useCorporationNumberValidator", () => {
  it("passes a number the API accepts", async () => {
    mockFetch({ corporationNumber: VALID_NUMBER, valid: true });

    await expect(validate(renderValidator(), VALID_NUMBER)).resolves.toBe(
      undefined,
    );
  });

  it("returns the API message for a number the API rejects", async () => {
    mockFetch({ valid: false, message: "Invalid corporation number" }, 404);

    await expect(validate(renderValidator(), INVALID_NUMBER)).resolves.toBe(
      "Invalid corporation number",
    );
  });

  it("fails validation when the API errors", async () => {
    mockFetch({ message: "Internal error" }, 500);

    await expect(validate(renderValidator(), VALID_NUMBER)).resolves.toBe(
      CORPORATION_NUMBER_UNVERIFIED_ERROR,
    );
  });

  it("fails validation when the request can't be sent", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>(() => Promise.reject(new TypeError("Failed to fetch"))),
    );

    await expect(validate(renderValidator(), VALID_NUMBER)).resolves.toBe(
      CORPORATION_NUMBER_UNVERIFIED_ERROR,
    );
  });

  it("requests the same number only once", async () => {
    const fetchMock = mockFetch({
      corporationNumber: VALID_NUMBER,
      valid: true,
    });
    const validator = renderValidator();

    await validate(validator, VALID_NUMBER);
    await validate(validator, VALID_NUMBER);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("drops the result for a value the user has since changed", async () => {
    const { respond } = mockPendingFetch();
    let currentValue = INVALID_NUMBER;

    const result = validate(renderValidator(), INVALID_NUMBER, {
      getCurrentValue: () => currentValue,
    });
    currentValue = VALID_NUMBER;
    respond({ valid: false, message: "Invalid corporation number" }, 404);

    await expect(result).resolves.toBeUndefined();
  });

  it("drops the failure for a value the user has since changed", async () => {
    const { respond } = mockPendingFetch();
    let currentValue = VALID_NUMBER;

    const result = validate(renderValidator(), VALID_NUMBER, {
      getCurrentValue: () => currentValue,
    });
    currentValue = INVALID_NUMBER;
    respond({ message: "Internal error" }, 500);

    await expect(result).resolves.toBeUndefined();
  });

  it("cancels the request when a run for a changed value is aborted", async () => {
    const { fetchMock } = mockPendingFetch();
    const controller = new AbortController();
    let currentValue = VALID_NUMBER;

    const result = validate(renderValidator(), VALID_NUMBER, {
      signal: controller.signal,
      getCurrentValue: () => currentValue,
    });
    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
    currentValue = INVALID_NUMBER;
    controller.abort();

    await expect(result).resolves.toBeUndefined();
    expect(fetchMock.mock.calls[0]?.[1]?.signal?.aborted).toBe(true);
  });

  it("keeps the request when a run for the same value is aborted", async () => {
    const { fetchMock, respond } = mockPendingFetch();
    const controller = new AbortController();
    const validator = renderValidator();

    const aborted = validate(validator, VALID_NUMBER, {
      signal: controller.signal,
    });
    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
    controller.abort();

    // A new run for the same value (e.g. on submit) reuses the request.
    const retried = validate(validator, VALID_NUMBER);
    respond({ valid: false, message: "Invalid corporation number" }, 404);

    await expect(aborted).resolves.toBeUndefined();
    await expect(retried).resolves.toBe("Invalid corporation number");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[1]?.signal?.aborted).toBe(false);
  });
});
