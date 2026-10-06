import { createServer, loadEnv } from "vite";
import { readFile, writeFile, mkdir } from "node:fs/promises";

const server = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
});
try {
  const { render } = await server.ssrLoadModule("/src/entry-server.tsx");
  const { metadata } = await server.ssrLoadModule("/src/data/seo.ts");
  const { projects } = await server.ssrLoadModule("/src/data/studio.ts");
  const base = server.config.base;
  const restore = `<script>(function(){var params=new URLSearchParams(location.search);var route=params.get('__webora_route');if(!route)return;try{var target=new URL(route,location.origin);if(target.origin!==location.origin||!target.pathname.startsWith(${JSON.stringify(base)}))return;history.replaceState(null,'',target.pathname+target.search+target.hash);document.documentElement.dataset.pagesRedirect='true';}catch{}})();</script>`;
  const template = (await readFile("dist/index.html", "utf8")).replace(
    "<!--pages-route-restore-->",
    restore,
  );
  const env = loadEnv("production", process.cwd(), "VITE_");
  const origin = (process.env.VITE_SITE_URL || env.VITE_SITE_URL)?.replace(
    /\/$/,
    "",
  );
  if (origin) {
    const url = new URL(origin);
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      ["localhost", "127.0.0.1"].includes(url.hostname) ||
      `${url.pathname.replace(/\/$/, "")}/` !== base
    )
      throw new Error(
        "VITE_SITE_URL must be an HTTPS site URL matching VITE_BASE_PATH, without credentials, query or hash.",
      );
  }
  const routes = [
    "/",
    "/work",
    "/services",
    "/studio",
    "/start-project",
    "/privacy",
    ...projects
      .filter((project) => project.caseStudy)
      .map((project) => `/work/${project.slug}`),
  ];
  const escape = (text) =>
    text
      .replaceAll("&", "&amp;")
      .replaceAll('"', "&quot;")
      .replaceAll("<", "&lt;");
  for (const path of routes) {
    const directory = path === "/" ? "dist" : `dist${path}`;
    await mkdir(directory, { recursive: true });
    const meta = metadata(path);
    let html = template
      .replace("<!--app-html-->", await render(path))
      .replaceAll("WEBORA — Web Design Studio", escape(meta.title))
      .replace(
        /(<meta name="description" content=")[^"]*("\s*\/?>)/,
        `$1${escape(meta.description)}$2`,
      )
      .replace(
        /(<meta property="og:description" content=")[^"]*("\s*\/?>)/,
        `$1${escape(meta.description)}$2`,
      );
    const structured = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Webora",
      description: "Web Design Studio",
      email: "kiratveersinghralhan@gmail.com",
      telephone: "+919814800017",
      sameAs: ["https://www.instagram.com/webora.web.design/"],
      ...(origin ? { url: origin } : {}),
    };
    html = html.replace(
      "</head>",
      `<meta name="twitter:title" content="${escape(meta.title)}" /><meta name="twitter:description" content="${escape(meta.description)}" /><script type="application/ld+json">${JSON.stringify(structured)}</script></head>`,
    );
    if (origin)
      html = html.replace(
        "</head>",
        `<link rel="canonical" href="${origin}${path}" /><meta property="og:url" content="${origin}${path}" /><meta property="og:image" content="${origin}/og.png" /><meta name="twitter:image" content="${origin}/og.png" /></head>`,
      );
    await writeFile(`${directory}/index.html`, html);
  }
  await writeFile(
    "dist/robots.txt",
    origin
      ? `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`
      : "User-agent: *\nDisallow: /\n",
  );
  await writeFile(
    "dist/404.html",
    template
      .replace("<!--app-html-->", await render("/404"))
      .replaceAll("WEBORA — Web Design Studio", "Page Not Found — WEBORA")
      .replace(
        "</head>",
        `<meta name="robots" content="noindex" /><script>(function(){var base=${JSON.stringify(base)};if(!location.pathname.startsWith(base)||location.pathname===base)return;location.replace(base+'?__webora_route='+encodeURIComponent(location.pathname+location.search+location.hash));})();</script></head>`,
      ),
  );
  await writeFile(
    "dist/sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${origin ? routes.map((path) => `<url><loc>${origin}${path}</loc></url>`).join("") : ""}</urlset>`,
  );
  await writeFile("dist/.nojekyll", "");
  console.log(
    `Prerendered ${routes.length} routes. ${origin ? "Canonical URLs and sitemap generated." : "Set VITE_SITE_URL before public release; preview indexing is disabled."}`,
  );
} finally {
  await server.close();
}
