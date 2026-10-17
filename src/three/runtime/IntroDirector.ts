export type IntroPhase = "settled" | "preparing" | "playing" | "handoff";
/** Whole brand reveal, request to settle: 1.5-2.5s on a first eligible visit. */
export const INTRO_DEADLINE = 2500;
/** Preparation never consumes the V3 revolution's visible playback time. */
const REVOLUTION_PREPARE_LIMIT = 9000;
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
  constructor(readonly choreography: "assembly" | "revolution" = "assembly") {}
  get deadlineAt() {
    if (this.choreography === "assembly")
      return this.requestedAt + INTRO_DEADLINE;
    return this.phase === "preparing"
      ? this.requestedAt + REVOLUTION_PREPARE_LIMIT
      : this.startedAt + this.duration + 250;
  }
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
    if (this.choreography === "revolution") {
      if (now >= this.deadlineAt) {
        this.finish("preparation-timeout");
        return;
      }
      // Hardware eligibility is checked before requesting. Low-tier hardware
      // can still present a finite turn with its existing lighter materials.
      this.startedAt = now;
      this.duration = this.mobile ? 4600 : 5200;
      this.transition("playing");
      return;
    }
    const remaining = INTRO_DEADLINE - (now - this.requestedAt) - 50;
    if ((low && !this.replay) || remaining < 900) {
      this.finish(low ? "low-tier" : "late-readiness");
      return;
    }
    this.startedAt = now;
    this.duration = Math.min(this.mobile ? 1600 : 2000, remaining);
    this.transition("playing");
  }
  sample(now: number) {
    if (this.phase === "settled") return 1;
    // A delayed final draw (or the watchdog firing between frames) still
    // completes the finite timeline. Only preparation can time out before it.
    if (
      this.choreography === "revolution" &&
      this.phase !== "preparing" &&
      now >= this.startedAt + this.duration
    ) {
      this.finish("complete");
      return 1;
    }
    if (now >= this.deadlineAt) {
      this.finish("deadline");
      return 1;
    }
    if (this.phase === "preparing") return 0;
    const progress = Math.min(
      1,
      Math.max(0, (now - this.startedAt) / this.duration),
    );
    if (progress >= 1) this.finish("complete");
    else if (progress >= (this.choreography === "revolution" ? 0.88 : 0.75))
      this.transition("handoff");
    return progress;
  }
  finish(reason: string) {
    if (this.choreography === "revolution" && this.phase === "settled") return;
    this.reason = reason;
    this.transition("settled");
  }
}
