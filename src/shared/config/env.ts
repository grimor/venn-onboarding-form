import z from "zod";

const envSchema = z.object({
  VITE_API_BASE_URL: z
    .url({ error: "VITE_API_BASE_URL must be a valid URL" })
    .transform((url) => url.replace(/\/+$/, "")),
});

// Fail fast at startup instead of on the first request.
const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  throw new Error(
    `Invalid environment configuration:\n${z.prettifyError(parsed.error)}`,
  );
}

export const env = {
  apiBaseUrl: parsed.data.VITE_API_BASE_URL,
};
