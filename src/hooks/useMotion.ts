import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { scrollToAnchor, scrollToPosition } from "../lib/scroll";
import { isMotionReduced } from "../lib/motionPreference";

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(isMotionReduced());
    update();
    query.addEventListener("change", update);
    window.addEventListener("webora-motion-change", update);
    return () => {
      query.removeEventListener("change", update);
      window.removeEventListener("webora-motion-change", update);
    };
  }, []);
  return reduced;
}
export function usePageMotion() {
  const { pathname, hash } = useLocation();
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced || isMotionReduced()) return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    import("../lib/pageMotion")
      .then(({ mountSmoothScroll }) => {
        if (!cancelled) cleanup = mountSmoothScroll();
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [reduced]);
  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    let anchorFrame = 0;
    if (!location.hash) scrollToPosition(0, true);
    if (location.hash)
      anchorFrame = requestAnimationFrame(() => scrollToAnchor(location.hash));
    if (!reduced && !isMotionReduced()) {
      import("../lib/pageMotion")
        .then(({ mountPageMotion }) => {
          if (!cancelled) cleanup = mountPageMotion(pathname, location.hash);
        })
        .catch(() => {
          /* Native scrolling and visible content remain the fallback. */
        });
    }
    return () => {
      cancelled = true;
      cancelAnimationFrame(anchorFrame);
      cleanup?.();
    };
  }, [pathname, reduced]);
  useEffect(() => {
    if (hash) scrollToAnchor(hash);
    else scrollToPosition(0, true);
    // Lazy route scenes can register their pins just after the first anchor calculation.
    const timer = hash ? window.setTimeout(() => scrollToAnchor(hash), 350) : 0;
    const cancel = () => clearTimeout(timer);
    window.addEventListener("wheel", cancel, { passive: true, once: true });
    window.addEventListener("touchstart", cancel, {
      passive: true,
      once: true,
    });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("wheel", cancel);
      window.removeEventListener("touchstart", cancel);
    };
  }, [hash]);
}
