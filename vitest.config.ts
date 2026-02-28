import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,

    include: ["__test__/**/*.test.ts"],

    testTimeout: 30000, // useful for DB / docker startup

    coverage: {
      reporter: ["text", "html"],
    },
  },
});