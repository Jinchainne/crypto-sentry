/**
 * In-memory TTL cache + token-bucket rate limiter for the SoSoValue client.
 */

export class TtlCache<V> {
  private store = new Map<string, { value: V; expires: number }>();

  constructor(private now: () => number = Date.now) {}

  get(key: string): V | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (this.now() >= entry.expires) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: string, value: V, ttlMs: number): void {
    this.store.set(key, { value, expires: this.now() + ttlMs });
  }

  async getOrSet(key: string, ttlMs: number, fn: () => Promise<V>): Promise<V> {
    const hit = this.get(key);
    if (hit !== undefined) return hit;
    const value = await fn();
    this.set(key, value, ttlMs);
    return value;
  }

  clear(): void {
    this.store.clear();
  }
}

export class RateLimiter {
  private timestamps: number[] = [];

  constructor(
    private readonly max: number,
    private readonly windowMs: number,
    private readonly now: () => number = Date.now,
    private readonly sleep: (ms: number) => Promise<void> = (ms) =>
      new Promise((r) => setTimeout(r, ms)),
  ) {}

  async acquire(): Promise<void> {
    for (;;) {
      const t = this.now();
      this.timestamps = this.timestamps.filter((ts) => t - ts < this.windowMs);
      if (this.timestamps.length < this.max) {
        this.timestamps.push(t);
        return;
      }
      const waitMs = this.windowMs - (t - this.timestamps[0]);
      await this.sleep(Math.max(waitMs, 1));
    }
  }
}
