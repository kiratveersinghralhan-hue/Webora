import { useSyncExternalStore } from "react";
import { isLocalPreview, useV2Experience } from "../lib/experience";
const subscribe = () => () => {};
/** Local comparison control; absent from server HTML and all public hosts. */
export function ExperienceSwitcher() {
  const local = useSyncExternalStore(subscribe, isLocalPreview, () => false);
  const experimental = useV2Experience();
  if (!local) return null;
  const url = new URL(location.href);
  url.searchParams.set("experience", experimental ? "v1" : "v2");
  return (
    <aside
      className="experience-switcher"
      aria-label="Local experience comparison"
    >
      <span>
        LOCAL / {experimental ? "V2 · Living studio" : "V1 comparison"}
      </span>
      <a href={`${url.pathname}${url.search}${url.hash}`} target="_self">
        Switch to {experimental ? "V1" : "V2"} ↗
      </a>
    </aside>
  );
}
