/** One continuous index, sampled by the shared world clock. No autonomous timer. */
export class GalleryController {
  position = 0;
  target = 0;
  velocity = 0;
  dragging = false;
  constructor(readonly count: number) {}
  private clamp(value: number) {
    return Math.max(0, Math.min(this.count - 1, value));
  }
  select(index: number) {
    this.target = this.clamp(index);
    this.dragging = false;
  }
  /** Relative to the settling target, so rapid presses accumulate. */
  step(delta: number) {
    this.select(Math.round(this.target) + delta);
  }
  start() {
    this.dragging = true;
    this.velocity = 0;
  }
  drag(delta: number, milliseconds: number) {
    this.position = this.target = this.clamp(this.position + delta);
    const sample = Math.max(-8, Math.min(8, delta / (milliseconds / 1000)));
    this.velocity +=
      (sample - this.velocity) * (1 - Math.exp(-milliseconds / 45));
  }
  end(cancelled: boolean) {
    this.dragging = false;
    this.target = this.clamp(
      Math.round(this.position + (cancelled ? 0 : this.velocity * 0.16)),
    );
    if (cancelled) this.velocity = 0;
  }
  update(delta: number) {
    if (this.dragging) return true;
    // Exact critically damped spring: the closed form is stable at any step,
    // so slow frames still settle in real time. The cap only bounds the jump
    // after a tab resume.
    const dt = Math.min(0.1, Math.max(0, delta)),
      omega = 12;
    const offset = this.position - this.target,
      c = this.velocity + omega * offset;
    const decay = Math.exp(-omega * dt);
    this.position = this.target + (offset + c * dt) * decay;
    this.velocity = (this.velocity - omega * c * dt) * decay;
    this.position = this.clamp(this.position);
    if (
      Math.abs(this.position - this.target) < 0.0005 &&
      Math.abs(this.velocity) < 0.005
    ) {
      this.position = this.target;
      this.velocity = 0;
      return false;
    }
    return true;
  }
}
