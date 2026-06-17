// In-memory store of consumed challenge nonces.
// Prevents replay of a captured (message, signature, challenge) within the 5-min TTL window.
// Single-instance only — works for the Docker deployment; would need Redis for multi-instance.

const store = new Map<string, number>(); // nonce → expiry timestamp (ms)

function pruneExpired() {
  const now = Date.now();
  for (const [nonce, exp] of store) {
    if (exp < now) store.delete(nonce);
  }
}

// Returns true and records the nonce if it hasn't been used yet; false if already consumed.
export function claimChallenge(nonce: string, exp: number): boolean {
  pruneExpired();
  if (store.has(nonce)) return false;
  store.set(nonce, exp);
  return true;
}
