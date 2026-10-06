import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "../hooks/useMotion";

/** Keep closing content out of the accessibility tree while its height settles. */
export function Disclosure({
  open,
  id,
  children,
}: {
  open: boolean;
  id: string;
  children: ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const [present, setPresent] = useState(open);
  const reduced = useReducedMotion();
  useLayoutEffect(() => {
    const element = panel.current!;
    if (open) setPresent(true);
    if (reduced) {
      setPresent(open);
      return;
    }
    const animation = element.animate(
      [
        {
          height: open ? "0px" : `${element.scrollHeight}px`,
          opacity: open ? 0 : 1,
        },
        {
          height: open ? `${element.scrollHeight}px` : "0px",
          opacity: open ? 1 : 0,
        },
      ],
      { duration: 230, easing: "cubic-bezier(.2,.8,.2,1)" },
    );
    animation.onfinish = () => {
      if (!open) setPresent(false);
    };
    return () => animation.cancel();
  }, [open, reduced]);
  return (
    <div
      ref={panel}
      id={id}
      className="service-disclosure"
      hidden={!open && !present}
      inert={!open}
      aria-hidden={!open}
    >
      {children}
    </div>
  );
}
