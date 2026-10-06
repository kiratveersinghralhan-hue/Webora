import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), "VITE_"), ...process.env };
  const base = env.VITE_BASE_PATH || "/";
  if (!/^\/(?:[^?#]*\/)?$/.test(base))
    throw new Error("VITE_BASE_PATH must start and end with /.");
  return {
    base,
    plugins: [
      react(),
      {
        name: "static-route-preview",
        configurePreviewServer(server) {
          server.middlewares.use((request, _response, next) => {
            const original = request.url?.split("?")[0] || "/";
            const prefix = base.replace(/\/$/, "");
            const path =
              original.slice(prefix.length).replace(/\/$/, "") || "/";
            if (
              [
                "/work",
                "/services",
                "/studio",
                "/start-project",
                "/privacy",
                "/work/form-and-field",
                "/work/off-script",
              ].includes(path) ||
              /^\/work\/(harvester-parts|veyrath|glossboss)$/.test(path)
            )
              request.url = `${prefix}${path}/index.html`;
            next();
          });
        },
      },
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks: (id: string) =>
            /\/three\/(src\/renderers|src\/extras\/PMREMGenerator)/.test(id)
              ? "three-renderer"
              : id.includes("/node_modules/three/")
                ? "three-foundation"
                : /\/(gsap|lenis)\//.test(id)
                  ? "motion"
                  : undefined,
        },
      },
    },
  };
});
