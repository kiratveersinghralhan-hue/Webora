/** Public assets and document URLs share Vite's deployment base. */
export const basePath = import.meta.env.BASE_URL;
export const routerBase = basePath;
export const assetUrl = (path: string) =>
  `${basePath}${path.replace(/^\//, "")}`;

/** DOM links include the base; React Router's navigate expects an app route. */
export function appRoute(url: URL): string | null {
  const prefix = basePath.replace(/\/$/, "");
  if (
    prefix &&
    url.pathname !== prefix &&
    !url.pathname.startsWith(`${prefix}/`)
  )
    return null;
  return `${url.pathname.slice(prefix.length) || "/"}${url.search}${url.hash}`;
}
