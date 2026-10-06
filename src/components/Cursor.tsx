import { useEffect, useRef } from "react";
import { useReducedMotion } from "../hooks/useMotion";
import { subscribePointer } from "../lib/pointer";
import { isMotionReduced } from "../lib/motionPreference";

export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (
      reduced ||
      isMotionReduced() ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches
    )
      return;
    const cursor = ref.current!;
    return subscribePointer((state) => {
      cursor.textContent = state.label;
      cursor.classList.toggle("has-label", !!state.label);
      cursor.style.opacity = state.active ? "1" : "0";
      cursor.style.transform = `translate3d(${state.x}px,${state.y}px,0) translate(-50%,-50%) scale(${1 + state.velocity * 0.08})`;
    });
  }, [reduced]);
  return <div className="cursor" ref={ref} aria-hidden="true" />;
}
