/** An explicit visitor choice can enable motion without changing their OS setting. */
export function localIntroReplay() {
  return (
    typeof window !== "undefined" &&
    ["localhost", "127.0.0.1", "[::1]"].includes(location.hostname) &&
    new URLSearchParams(location.search).get("intro") === "1"
  );
}
let enabled = localIntroReplay();
if (typeof window !== "undefined") {
  try {
    enabled ||= sessionStorage.getItem("webora-motion") === "full";
  } catch {
    /* Optional preference storage. */
  }
  document.documentElement.dataset.motion = enabled ? "full" : "system";
}
export function isMotionReduced() {
  return (
    typeof window !== "undefined" &&
    !enabled &&
    matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
export function enableMotion() {
  enabled = true;
  document.documentElement.dataset.motion = "full";
  try {
    sessionStorage.setItem("webora-motion", "full");
  } catch {
    /* Optional preference storage. */
  }
  window.dispatchEvent(new Event("webora-motion-change"));
}
