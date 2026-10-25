import { vi } from "vitest";

/** Stubs `fetch` to resolve with `body` as JSON (or empty when `undefined`). */
export function mockFetch(body: unknown, status = 200) {
  const fetchMock = vi.fn<typeof fetch>(() =>
    Promise.resolve(
      new Response(body === undefined ? null : JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
      }),
    ),
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}
