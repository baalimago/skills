/**
 * Fetch JSON; reject on a non-2xx status, on timeout, or on abort.
 * @param {string} url
 * @param {{ signal?: AbortSignal, timeoutMs?: number }} [options]
 * @returns {Promise<unknown>}
 */
export async function fetchJSON(url, { signal, timeoutMs = 8000 } = {}) {
  const signals = [AbortSignal.timeout(timeoutMs)];
  if (signal) signals.push(signal);
  const response = await fetch(url, { signal: AbortSignal.any(signals) });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} for ${url}`);
  }
  return response.json();
}
