import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@raycast/api": path.resolve(import.meta.dirname, "test/mocks/raycast-api.ts"),
    },
  },
});
