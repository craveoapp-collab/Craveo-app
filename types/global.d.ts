// Global type for rate limit store
declare global {
  var rateLimitStore: Record<string, number[]> | undefined;
}

export {};
