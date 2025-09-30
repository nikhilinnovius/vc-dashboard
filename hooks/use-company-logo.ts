"use client"

import { useState, useEffect, useCallback } from "react"

interface LogoCache {
  [domain: string]: {
    url: string | null
    timestamp: number
    loading: boolean
  }
}

// Enhanced cache with better management
const logoCache: LogoCache = {}
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes
const MAX_CACHE_SIZE = 500 // Maximum number of cached logos

// Clean up old cache entries
const cleanupCache = () => {
  const now = Date.now()
  const entries = Object.entries(logoCache)

  // Remove expired entries
  entries.forEach(([domain, entry]) => {
    if (now - entry.timestamp > CACHE_DURATION) {
      delete logoCache[domain]
    }
  })

  // If still too many entries, remove oldest ones
  const remainingEntries = Object.entries(logoCache)
  if (remainingEntries.length > MAX_CACHE_SIZE) {
    const sortedEntries = remainingEntries.sort((a, b) => a[1].timestamp - b[1].timestamp)
    const toRemove = sortedEntries.slice(0, remainingEntries.length - MAX_CACHE_SIZE)
    toRemove.forEach(([domain]) => delete logoCache[domain])
  }
}

// Batch logo requests to reduce server load
const pendingRequests = new Map<string, Promise<string | null>>()

const fetchLogo = async (domain: string): Promise<string | null> => {
  if (!domain) return null

  // Check if request is already pending
  if (pendingRequests.has(domain)) {
    return pendingRequests.get(domain)!
  }

  const request = (async () => {
    try {
      const response = await fetch(`/api/logos/${encodeURIComponent(domain)}`, {
        cache: "force-cache",
        next: { revalidate: 3600 }, // Cache for 1 hour
      })

      if (!response.ok) {
        return null
      }

      const data = await response.json()
      return data.url || null // Changed from data.logoUrl to data.url
    } catch (error) {
      console.error(`Error fetching logo for ${domain}:`, error)
      return null
    } finally {
      pendingRequests.delete(domain)
    }
  })()

  pendingRequests.set(domain, request)
  return request
}

export function useCompanyLogo(domain: string | undefined, name: string) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cleanDomain = useCallback((url: string) => {
    if (!url) return ""
    return url
      .replace(/^(https?:\/\/)?(www\.)?/i, "")
      .split("/")[0]
      .toLowerCase()
      .trim()
  }, [])

  const loadLogo = useCallback(
    async (targetDomain: string) => {
      if (!targetDomain) {
        setLogoUrl(null)
        setIsLoading(false)
        return
      }

      const cleaned = cleanDomain(targetDomain)
      if (!cleaned) {
        setLogoUrl(null)
        setIsLoading(false)
        return
      }

      // Check cache first
      const cached = logoCache[cleaned]
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setLogoUrl(cached.url)
        setIsLoading(cached.loading)
        setError(null)
        return
      }

      // If already loading, don't start another request
      if (cached?.loading) {
        return
      }

      setIsLoading(true)
      setError(null)

      // Mark as loading in cache
      logoCache[cleaned] = {
        url: null,
        timestamp: Date.now(),
        loading: true,
      }

      try {
        const url = await fetchLogo(cleaned)

        // Update cache
        logoCache[cleaned] = {
          url,
          timestamp: Date.now(),
          loading: false,
        }

        setLogoUrl(url)
        setError(null)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load logo"
        setError(errorMessage)

        // Cache the error result
        logoCache[cleaned] = {
          url: null,
          timestamp: Date.now(),
          loading: false,
        }
      } finally {
        setIsLoading(false)
      }
    },
    [cleanDomain],
  )

  useEffect(() => {
    if (domain) {
      loadLogo(domain)
    } else {
      setLogoUrl(null)
      setIsLoading(false)
      setError(null)
    }
  }, [domain, loadLogo])

  // Cleanup cache periodically
  useEffect(() => {
    const interval = setInterval(cleanupCache, 5 * 60 * 1000) // Every 5 minutes
    return () => clearInterval(interval)
  }, [])

  return {
    logoUrl,
    isLoading,
    error,
    retry: () => domain && loadLogo(domain),
  }
}

// Export cache stats for debugging
export const getLogoCacheStats = () => ({
  size: Object.keys(logoCache).length,
  maxSize: MAX_CACHE_SIZE,
  pendingRequests: pendingRequests.size,
})
