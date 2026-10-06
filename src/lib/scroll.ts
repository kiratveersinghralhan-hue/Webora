import { isMotionReduced } from "./motionPreference";
let driver: ((top: number, immediate: boolean) => void) | undefined;
export function setScrollDriver(next?: typeof driver) {
  driver = next;
}
export function scrollToPosition(top: number, immediate = false) {
  const instant = immediate || isMotionReduced();
  if (driver) driver(top, instant);
  else window.scrollTo({ top, behavior: instant ? "instant" : "smooth" });
}
export function scrollToAnchor(hash: string) {
  const target = document.getElementById(decodeURIComponent(hash.slice(1)));
  if (!target) return;
  const header =
    document.querySelector(".site-header")?.getBoundingClientRect().height ??
    85;
  scrollToPosition(target.getBoundingClientRect().top + scrollY - header - 24);
}
