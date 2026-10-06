import { chromium } from "@playwright/test";
import { readFile } from "node:fs/promises";
const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });
  const svg = await readFile("public/og.svg", "utf8");
  await page.setContent(
    `<style>body{margin:0}svg{display:block;width:1200px;height:630px}</style>${svg}`,
  );
  await page.screenshot({ path: "public/og.png" });
} finally {
  await browser.close();
}
