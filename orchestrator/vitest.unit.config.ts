import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,

    include: ["src/**/*.test.ts"],
    exclude: ["src/__test__/*"],

    testTimeout: 30000, // useful for DB / docker startup

    coverage: {
      reporter: ["text", "html"],
    },
  },
});