/**
 * Retries an async operation on failure. Useful for transient network errors
 * (e.g. ERR_STREAM_PREMATURE_CLOSE) that are more common on resource-constrained
 * hosts, where the connection can drop mid-response under CPU/memory pressure.
 */
export async function withRetry(fn, { retries = 2, delayMs = 1500 } = {}) {
  let lastErr
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastErr = err
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)))
      }
    }
  }
  throw lastErr
}
