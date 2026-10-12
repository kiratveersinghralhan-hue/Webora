type Disposable = { dispose(): void };
/** Shared keyed resources with explicit leases; one dispose even for shared geometry. */
export class AssetRegistry {
  private entries = new Map<string, { resource: Disposable; users: number }>();
  private closed = false;
  acquire<T extends Disposable>(
    key: string,
    create: () => T,
  ): { value: T; release(): void } {
    if (this.closed) throw new Error("Asset registry is disposed");
    let entry = this.entries.get(key);
    if (!entry) {
      entry = { resource: create(), users: 0 };
      this.entries.set(key, entry);
    }
    entry.users++;
    let released = false;
    return {
      value: entry.resource as T,
      release: () => {
        if (released || this.closed) return;
        released = true;
        if (--entry.users === 0) {
          this.entries.delete(key);
          entry.resource.dispose();
        }
      },
    };
  }
  get size() {
    return this.entries.size;
  }
  dispose() {
    if (this.closed) return;
    this.closed = true;
    const entries = [...this.entries.values()];
    this.entries.clear();
    const errors: unknown[] = [];
    for (const entry of entries) {
      try {
        entry.resource.dispose();
      } catch (error) {
        errors.push(error);
      }
    }
    if (errors.length) throw new AggregateError(errors, "Asset cleanup failed");
  }
}
