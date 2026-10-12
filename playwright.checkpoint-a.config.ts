import { defineConfig } from "@playwright/test";
import foundation from "./playwright.v2.config";
export default defineConfig({
  ...foundation,
  testMatch: ["checkpoint-a.spec.ts", "runtime.spec.ts"],
  reporter: [
    ["list"],
    ["json", { outputFile: "test-results/checkpoint-a/browser-results.json" }],
  ],
  outputDir: "test-results/checkpoint-a/playwright",
  webServer: [
    {
      command: "npm run dev -- --port 5175 --strictPort",
      url: "http://127.0.0.1:5175",
      reuseExistingServer: true,
      timeout: 180000,
    },
    {
      command: "npm run preview -- --port 4175 --strictPort",
      url: "http://127.0.0.1:4175",
      reuseExistingServer: true,
      timeout: 180000,
    },
  ],
});
