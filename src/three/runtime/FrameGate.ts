/** Separates ticker scheduling from expensive GPU draws. */
export class FrameGate {
  visible = true;
  hidden = false;
  ready = false;
  disposed = false;
  lost = false;
  dirty = true;
  moving = false;
  private last = -Infinity;
  canDraw(time: number, fps: number) {
    return (
      !this.disposed &&
      !this.lost &&
      this.ready &&
      this.visible &&
      !this.hidden &&
      (this.dirty || this.moving) &&
      time - this.last >= 1 / fps - 0.001
    );
  }
  presented(time: number, moving: boolean) {
    this.last = time;
    this.dirty = false;
    this.moving = moving;
  }
  invalidate() {
    if (!this.disposed) this.dirty = true;
  }
}
