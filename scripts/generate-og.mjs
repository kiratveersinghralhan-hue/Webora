import { chromium } from "@playwright/test";
import { readFile } from "node:fs/promises";
const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });
  const svg = await readFile("public/og.svg", "utf8");
  // The bundled brand fonts, inlined so the card renders in the site's type.
  const font = async (family, file) =>
    `@font-face{font-family:${family};src:url(data:font/woff2;base64,${(
      await readFile(`public/fonts/${file}`)
    ).toString("base64")}) format("woff2");font-weight:300 700}`;
  const faces =
    (await font("Space", "space-grotesk-latin.woff2")) +
    (await font("DM", "dm-sans-latin.woff2"));
  await page.setContent(
    `<style>${faces}body{margin:0}svg{display:block;width:1200px;height:630px}</style>${svg}`,
  );
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: "public/og.png" });
} finally {
  await browser.close();
}
