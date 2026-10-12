import { defineConfig } from "@playwright/test";
import base from "./playwright.v2.config";
export default defineConfig({
  ...base,
  testMatch: [
    "release.spec.ts",
    "checkpoint-a.spec.ts",
    "runtime.spec.ts",
    "identity.spec.ts",
  ],
  workers: 1,
  outputDir: process.env.WEBORA_RELEASE_ARTIFACTS ?? "test-results/release/playwright",
  reporter: [
    ["list"],
    [
      "json",
      {
        outputFile:
          process.env.WEBORA_RELEASE_REPORT ??
          "test-results/release/browser-results.json",
      },
    ],
  ],
  webServer: base.webServer!.map((server) => ({
    ...server,
    reuseExistingServer: true,
  })),
});
