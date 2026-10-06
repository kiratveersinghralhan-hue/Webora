/** Horizontal intent is required on touch so native vertical page scrolling wins. */
export function horizontalDrag(
  element: HTMLElement,
  handlers: {
    start?: () => void;
    move: (dx: number, dy: number, dt: number) => void;
    end?: (cancelled: boolean) => void;
  },
) {
  let id = -1,
    startX = 0,
    startY = 0,
    x = 0,
    y = 0,
    time = 0,
    dragging = false,
    rejected = false;
  let suppressUntil = 0;
  const down = (e: PointerEvent) => {
    if (
      e.button !== 0 ||
      id !== -1 ||
      (e.target as Element).closest("button,input,a[data-no-drag]")
    )
      return;
    id = e.pointerId;
    startX = x = e.clientX;
    startY = y = e.clientY;
    time = e.timeStamp;
    rejected = dragging = false;
  };
  const move = (e: PointerEvent) => {
    if (e.pointerId !== id || rejected) return;
    if (!dragging) {
      const dx = Math.abs(e.clientX - startX),
        dy = Math.abs(e.clientY - startY);
      if (dx + dy < 7) return;
      if (e.pointerType !== "mouse" && dy > dx * 1.1) {
        rejected = true;
        return;
      }
      dragging = true;
      element.setPointerCapture(id);
      element.dataset.dragging = "true";
      handlers.start?.();
    }
    e.preventDefault();
    handlers.move(
      e.clientX - x,
      e.clientY - y,
      Math.max(8, e.timeStamp - time),
    );
    x = e.clientX;
    y = e.clientY;
    time = e.timeStamp;
  };
  const end = (e: PointerEvent) => {
    if (e.pointerId !== id) return;
    // Touch starts with implicit capture on the canvas/link. Moving capture to
    // our surface emits a bubbling loss from that child, which is not a cancel.
    if (
      e.type === "lostpointercapture" &&
      (e.target !== element || element.hasPointerCapture(id))
    )
      return;
    if (dragging) {
      suppressUntil = performance.now() + 350;
      handlers.end?.(e.type !== "pointerup");
    }
    const released = id;
    id = -1;
    if (element.hasPointerCapture(released))
      element.releasePointerCapture(released);
    delete element.dataset.dragging;
    dragging = false;
  };
  const click = (e: MouseEvent) => {
    if (e.detail === 0 || (e.target as Element).closest("button")) return;
    if (performance.now() < suppressUntil) {
      e.preventDefault();
      e.stopPropagation();
    }
  };
  const preventDrag = (e: Event) => e.preventDefault();
  element.addEventListener("pointerdown", down);
  element.addEventListener("pointermove", move, { passive: false });
  element.addEventListener("pointerup", end);
  element.addEventListener("pointercancel", end);
  element.addEventListener("lostpointercapture", end);
  element.addEventListener("click", click, true);
  element.addEventListener("dragstart", preventDrag);
  return () => {
    if (id !== -1 && element.hasPointerCapture(id))
      element.releasePointerCapture(id);
    element.removeEventListener("pointerdown", down);
    element.removeEventListener("pointermove", move);
    element.removeEventListener("pointerup", end);
    element.removeEventListener("pointercancel", end);
    element.removeEventListener("lostpointercapture", end);
    element.removeEventListener("click", click, true);
    element.removeEventListener("dragstart", preventDrag);
    delete element.dataset.dragging;
  };
}
