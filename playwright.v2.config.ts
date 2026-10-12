import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/v2-browser",
  workers: 1,
  outputDir: "test-results/v2-playwright",
  reporter: [
    ["list"],
    ["json", { outputFile: "test-results/v2-1a/browser-results.json" }],
  ],
  timeout: 90000,
  expect: { timeout: 20000 },
  use: {
    baseURL: "http://127.0.0.1:5175",
    trace: "retain-on-failure",
    launchOptions: { args: ["--use-angle=swiftshader"] },
  },
  webServer: [
    {
      command: "npm run dev -- --port 5175 --strictPort",
      url: "http://127.0.0.1:5175",
      reuseExistingServer: false,
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
