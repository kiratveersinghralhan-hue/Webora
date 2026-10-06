import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import "./styles/global.css";
import "./styles/spatial.css";
import "./styles/immersive.css";
import "./styles/experience.css";
import { captureAttribution } from "./lib/attribution";
import { routerBase } from "./lib/site";

captureAttribution();

const root = document.getElementById("root")!;
if (document.documentElement.dataset.pagesRedirect) root.replaceChildren();
const app = (
  <StrictMode>
    <BrowserRouter basename={routerBase}>
      <App />
    </BrowserRouter>
  </StrictMode>
);
if (root.hasChildNodes() && root.querySelector("main")) hydrateRoot(root, app);
else createRoot(root).render(app);
