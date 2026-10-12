import { useSyncExternalStore } from "react";

export const isLocalPreview = () =>
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1", "[::1]"].includes(location.hostname);

let selected: boolean | undefined;
/** V2 is the release default. The legacy comparison remains available only locally. */
export function isV2Experience() {
  if (!isLocalPreview()) return true;
  if (selected !== undefined) return selected;
  const choice = new URLSearchParams(location.search).get("experience");
  try {
    selected = choice
      ? choice === "v2"
      : sessionStorage.getItem("webora-local-experience") !== "v1";
    sessionStorage.setItem("webora-local-experience", selected ? "v2" : "v1");
  } catch {
    selected = choice !== "v1";
  }
  return selected;
}
const subscribe = () => () => {};
export function useV2Experience() {
  return useSyncExternalStore(subscribe, isV2Experience, () => true);
}
