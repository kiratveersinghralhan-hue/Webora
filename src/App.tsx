import { Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { Layout } from "./layouts/Layout";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import { metadata } from "./data/seo";

const Work = lazy(() => import("./pages/Work"));
const CaseStudy = lazy(() => import("./pages/CaseStudy"));
const Services = lazy(() => import("./pages/Services"));
const Studio = lazy(() => import("./pages/Studio"));
const Privacy = lazy(() => import("./pages/Privacy"));
const StartProject = lazy(() => import("./pages/StartProject"));
const DiwaliGifts = lazy(() => import("./pages/DiwaliGifts"));
const page = (content: React.ReactNode) => (
  <Suspense
    fallback={
      <div className="section route-loading" role="status">
        Opening the studio…
      </div>
    }
  >
    {content}
  </Suspense>
);

export function App() {
  const { pathname } = useLocation();
  useEffect(() => {
    const route = pathname.replace(/\/$/, "") || "/";
    const { title, description } = metadata(route);
    document.title = title;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", description);
    document
      .querySelector('meta[property="og:title"]')
      ?.setAttribute("content", title);
    document
      .querySelector('meta[property="og:description"]')
      ?.setAttribute("content", description);
    document
      .querySelector('meta[name="twitter:title"]')
      ?.setAttribute("content", title);
    document
      .querySelector('meta[name="twitter:description"]')
      ?.setAttribute("content", description);
    const origin = import.meta.env.VITE_SITE_URL;
    if (origin) {
      let canonical = document.querySelector<HTMLLinkElement>(
        'link[rel="canonical"]',
      );
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.rel = "canonical";
        document.head.appendChild(canonical);
      }
      canonical.href = `${origin.replace(/\/$/, "")}${route}`;
      document
        .querySelector('meta[property="og:url"]')
        ?.setAttribute("content", canonical.href);
    }
  }, [pathname]);
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="work" element={page(<Work />)} />
        <Route path="work/:slug" element={page(<CaseStudy />)} />
        <Route path="services" element={page(<Services />)} />
        <Route path="studio" element={page(<Studio />)} />
        <Route path="start-project" element={page(<StartProject />)} />
        <Route path="diwali-gifts" element={page(<DiwaliGifts />)} />
        <Route path="privacy" element={page(<Privacy />)} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
