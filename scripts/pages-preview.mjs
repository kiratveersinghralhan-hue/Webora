// A local GitHub Pages simulation: directory redirects and a genuine 404 response.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";

const root = resolve("dist");
const base = "/Webora/";
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".xml": "application/xml",
  ".txt": "text/plain",
};
createServer(async (request, response) => {
  const url = new URL(request.url, "http://127.0.0.1:4180");
  try {
    if (!url.pathname.startsWith(base)) throw new Error("Outside base");
    let file = resolve(
      root,
      decodeURIComponent(url.pathname.slice(base.length)) || ".",
    );
    if (file !== root && !file.startsWith(root + sep))
      throw new Error("Outside root");
    if ((await stat(file)).isDirectory()) {
      if (!url.pathname.endsWith("/")) {
        response
          .writeHead(301, { Location: `${url.pathname}/${url.search}` })
          .end();
        return;
      }
      file = resolve(file, "index.html");
    }
    const body = await readFile(file);
    response
      .writeHead(200, {
        "Content-Type": types[extname(file)] || "application/octet-stream",
      })
      .end(body);
  } catch {
    response
      .writeHead(404, { "Content-Type": "text/html" })
      .end(await readFile(resolve(root, "404.html")));
  }
}).listen(4180, "127.0.0.1", () =>
  console.log("Pages simulation: http://127.0.0.1:4180/Webora/"),
);
