export type IntroPhase = "settled" | "preparing" | "playing" | "handoff";
export const INTRO_DEADLINE = 2900;
/** Logical timeline only. The existing world clock samples it; no RAF or timer ownership. */
export class IntroDirector {
  phase: IntroPhase = "settled";
  reason = "session";
  requestedAt = 0;
  startedAt = 0;
  duration = 0;
  replay = false;
  mobile = false;
  private listeners = new Set<() => void>();
  private requested = false;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  snapshot = () => this.phase;
  private transition(phase: IntroPhase) {
    if (this.phase === phase) return;
    this.phase = phase;
    this.listeners.forEach((listener) => listener());
  }
  request(
    now: number,
    options: {
      seen: boolean;
      reduced: boolean;
      eligible: boolean;
      replay: boolean;
      mobile: boolean;
    },
  ) {
    if (this.requested) return;
    this.requested = true;
    this.replay = options.replay;
    this.mobile = options.mobile;
    if (
      !options.eligible ||
      options.reduced ||
      (options.seen && !options.replay)
    )
      return;
    this.requestedAt = now;
    this.reason = "preparing";
    this.transition("preparing");
  }
  ready(now: number, low: boolean) {
    if (this.phase !== "preparing") return;
    const remaining = INTRO_DEADLINE - (now - this.requestedAt) - 50;
    if ((low && !this.replay) || remaining < 900) {
      this.finish(low ? "low-tier" : "late-readiness");
      return;
    }
    this.startedAt = now;
    this.duration = Math.min(this.mobile ? 1400 : 2200, remaining);
    this.transition("playing");
  }
  sample(now: number) {
    if (this.phase === "settled") return 1;
    if (now - this.requestedAt >= INTRO_DEADLINE) {
      this.finish("deadline");
      return 1;
    }
    if (this.phase === "preparing") return 0;
    const progress = Math.min(
      1,
      Math.max(0, (now - this.startedAt) / this.duration),
    );
    if (progress >= 1) this.finish("complete");
    else if (progress >= 0.75) this.transition("handoff");
    return progress;
  }
  finish(reason: string) {
    this.reason = reason;
    this.transition("settled");
  }
}
