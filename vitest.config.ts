import { resolve } from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // ... Specify options here.
  },
  resolve: {
    alias: [{ find: "@", replacement: resolve(__dirname, "./src") }],
  },
});
