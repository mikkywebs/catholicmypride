'use client'

import { useSyncExternalStore } from 'react'

const noop = () => () => {}

/**
 * Reads a browser-only value (localStorage, URL, clock) without a hydration mismatch.
 * The server and first render get `fallback`; the browser value follows straight after.
 * `get` must return a primitive (string, number, boolean or null).
 */
export function useClientValue<T extends string | number | boolean | null>(get: () => T, fallback: T): T {
  return useSyncExternalStore(noop, () => { try { return get() } catch { return fallback } }, () => fallback)
}
