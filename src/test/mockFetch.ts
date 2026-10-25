import { vi } from "vitest";

/** Creates a response with `body` as JSON (or empty when `undefined`). */
export function jsonResponse(body: unknown, status = 200) {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** Stubs `fetch` to resolve with `body` as JSON (or empty when `undefined`). */
export function mockFetch(body: unknown, status = 200) {
  const fetchMock = vi.fn<typeof fetch>(() =>
    Promise.resolve(jsonResponse(body, status)),
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}
