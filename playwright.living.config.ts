import { defineConfig } from "@playwright/test";
import foundation from "./playwright.v2.config";
export default defineConfig({
  ...foundation,
  testMatch: ["runtime.spec.ts", "living.spec.ts"],
  reporter: [
    ["list"],
    ["json", { outputFile: "test-results/living-m1/browser-results.json" }],
  ],
  outputDir: "test-results/living-m1/playwright",
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
      reuseExistingServer: false,
      timeout: 180000,
    },
  ],
});
