import type z from "zod";

import { env } from "../config/env";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, body: unknown, message?: string) {
    super(
      message ??
        getBodyMessage(body) ??
        `API request failed (HTTP ${String(status)})`,
    );
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

function getBodyMessage(body: unknown): string | undefined {
  if (
    typeof body === "object" &&
    body !== null &&
    "message" in body &&
    typeof body.message === "string"
  ) {
    return body.message;
  }
  return undefined;
}

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

interface RequestOptions<TSchema extends z.ZodType> {
  method?: HttpMethod;
  body?: unknown;
  schema: TSchema;
  signal?: AbortSignal;
}

type CallOptions = Pick<RequestOptions<z.ZodType>, "signal">;

/**
 * Sends a JSON request to the API, resolving `path` against the configured
 * base URL.
 *
 * Throws `ApiError` for non-2xx responses (with the parsed body attached) and
 * for 2xx responses that don't match `schema`.
 */
async function request<TSchema extends z.ZodType>(
  path: string,
  { method = "GET", body, schema, signal }: RequestOptions<TSchema>,
): Promise<z.output<TSchema>> {
  const hasBody = body !== undefined;

  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    method,
    signal: signal
      ? AbortSignal.any([signal, AbortSignal.timeout(10_000)])
      : AbortSignal.timeout(10_000),
    headers: {
      Accept: "application/json",
      ...(hasBody && { "Content-Type": "application/json" }),
    },
    body: hasBody ? JSON.stringify(body) : undefined,
  });

  const data = await parseBody(response);

  if (!response.ok) {
    throw new ApiError(response.status, data);
  }

  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    throw new ApiError(response.status, data, "Unexpected API response");
  }

  return parsed.data;
}

export const apiClient = {
  get<TSchema extends z.ZodType>(
    path: string,
    schema: TSchema,
    options?: CallOptions,
  ) {
    return request(path, { ...options, schema });
  },

  post<TSchema extends z.ZodType>(
    path: string,
    body: unknown,
    schema: TSchema,
    options?: CallOptions,
  ) {
    return request(path, { ...options, method: "POST", body, schema });
  },
};

/** Returns a user-facing message for an error thrown by an API call. */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError && getBodyMessage(error.body)
    ? error.message
    : fallback;
}
