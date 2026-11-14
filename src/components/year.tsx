'use client'

import { useSyncExternalStore } from 'react'

const noop = () => () => {}

/** Current year on the visitor's device. Falls back to the year the page was built. */
export function CopyrightYear() {
  const year = useSyncExternalStore(noop, () => new Date().getFullYear(), () => BUILD_YEAR)
  return <>{year}</>
}

const BUILD_YEAR = Number(process.env.NEXT_PUBLIC_BUILD_YEAR) || 2026
