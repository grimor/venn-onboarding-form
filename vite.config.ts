import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    unstubGlobals: true,
    env: {
      VITE_API_BASE_URL: "https://api.test",
    },
  },
});
