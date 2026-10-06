import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/pages",
  workers: 1,
  timeout: 60000,
  use: {
    baseURL: process.env.WEBORA_TEST_URL || "http://127.0.0.1:4180/Webora/",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: process.env.WEBORA_TEST_URL
    ? undefined
    : {
        command: "node scripts/pages-preview.mjs",
        url: "http://127.0.0.1:4180/Webora/",
        reuseExistingServer: false,
      },
  reporter: [["list"]],
});
