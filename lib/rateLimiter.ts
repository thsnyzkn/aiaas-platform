const WINDOW_MS = 60_000; // 60 seconds

const store = new Map<string, number[]>();

export function checkRateLimit(
  key: string,
  limit: number
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  const timestamps = (store.get(key) ?? []).filter((t) => t > windowStart);

  if (timestamps.length >= limit) {
    const oldest = timestamps[0];
    const retryAfter = Math.ceil((oldest + WINDOW_MS - now) / 1000);
    store.set(key, timestamps);
    return { allowed: false, retryAfter };
  }

  timestamps.push(now);
  store.set(key, timestamps);
  return { allowed: true };
}

export function resetRateLimiter() {
  store.clear();
}
