import { spawn } from "node:child_process";
// Test-only fixture, not a real form ID. Playwright intercepts ALL Formspree calls.
const child = spawn(
  process.execPath,
  [
    "node_modules/vite/bin/vite.js",
    "--host",
    "127.0.0.1",
    "--port",
    "5174",
    "--strictPort",
  ],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      VITE_FORMSPREE_FORM_ID: "testfixture",
      VITE_SITE_URL: "",
    },
  },
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => child.kill(signal));
child.on("exit", (code) => process.exit(code || 0));
