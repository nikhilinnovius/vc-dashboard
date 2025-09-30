"use client"

import { useRef, useCallback } from "react"

interface CacheEntry<T> {
  results: T[]
  timestamp: number
}

export function useSearchCache<T>(ttl: number = 5 * 60 * 1000) {
  // 5 minutes default TTL
  const cache = useRef(new Map<string, CacheEntry<T>>())

  const getCachedResults = useCallback(
    (query: string): T[] | null => {
      const entry = cache.current.get(query.toLowerCase())
      if (!entry) return null

      const now = Date.now()
      if (now - entry.timestamp > ttl) {
        cache.current.delete(query.toLowerCase())
        return null
      }

      return entry.results
    },
    [ttl],
  )

  const setCachedResults = useCallback((query: string, results: T[]) => {
    // Limit cache size to prevent memory issues
    if (cache.current.size > 100) {
      const oldestKey = cache.current.keys().next().value
      cache.current.delete(oldestKey)
    }

    cache.current.set(query.toLowerCase(), {
      results: [...results], // Create a copy to prevent mutations
      timestamp: Date.now(),
    })
  }, [])

  const clearCache = useCallback(() => {
    cache.current.clear()
  }, [])

  return {
    getCachedResults,
    setCachedResults,
    clearCache,
  }
}
