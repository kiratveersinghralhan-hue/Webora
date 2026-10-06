import { readFile, readdir, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { gzipSync } from "node:zlib";

async function bundle(directory) {
  const html = await readFile(join(directory, "index.html"), "utf8");
  const initial = [
    ...new Set(
      [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+\.js)"/g)].map(
        (match) => match[1],
      ),
    ),
  ];
  const assets = await Promise.all(
    initial.map(async (file) => {
      const content = await readFile(join(directory, file));
      return { file, bytes: content.length, gzip: gzipSync(content).length };
    }),
  );
  const chunks = await Promise.all(
    (await readdir(join(directory, "assets")))
      .filter((file) => file.endsWith(".js"))
      .map(async (file) => ({
        file,
        bytes: (await stat(join(directory, "assets", file))).size,
        initial: initial.includes(`/assets/${file}`),
      })),
  );
  return {
    initial: assets,
    bytes: assets.reduce((sum, a) => sum + a.bytes, 0),
    gzip: assets.reduce((sum, a) => sum + a.gzip, 0),
    chunks,
  };
}
const current = await bundle(resolve("dist"));
const baseline = process.argv[2]
  ? await bundle(resolve(process.argv[2]))
  : null;
console.log(
  JSON.stringify(
    {
      baseline,
      current,
      change: baseline
        ? {
            bytes: current.bytes - baseline.bytes,
            percent: (current.bytes / baseline.bytes - 1) * 100,
          }
        : null,
    },
    null,
    2,
  ),
);
