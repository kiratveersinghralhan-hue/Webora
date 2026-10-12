import { defineConfig } from "@playwright/test";
import foundation from "./playwright.v2.config";
export default defineConfig({
  ...foundation,
  outputDir: "test-results/v2-1b/playwright",
  reporter: [
    ["list"],
    ["json", { outputFile: "test-results/v2-1b/browser-results.json" }],
  ],
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
