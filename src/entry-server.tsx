import { renderToPipeableStream } from "react-dom/server";
import { PassThrough } from "node:stream";
import { StaticRouter } from "react-router-dom";
import { App } from "./App";
import { routerBase } from "./lib/site";
export function render(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const output = new PassThrough();
    let html = "";
    output.on("data", (chunk) => {
      html += chunk.toString();
    });
    output.on("end", () => resolve(html));
    const stream = renderToPipeableStream(
      <StaticRouter
        basename={routerBase}
        location={`${routerBase.replace(/\/$/, "")}${path}`}
      >
        <App />
      </StaticRouter>,
      {
        onAllReady() {
          stream.pipe(output);
        },
        onError(error) {
          reject(error);
        },
      },
    );
  });
}
