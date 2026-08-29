'use client'

import { useEffect, useState } from 'react'

/**
 * Every scroll sequence on this site has a composed static end-state. This
 * hook is what switches to it. It starts `false` so the server and the first
 * client paint agree, then corrects on mount.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(query.matches)
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  return reduced
}
