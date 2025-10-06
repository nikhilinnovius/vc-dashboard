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

// Priority queue for logo loading
interface LogoRequest {
  domain: string
  priority: number
  resolve: (url: string | null) => void
  reject: (error: Error) => void
}

const logoQueue: LogoRequest[] = []
const MAX_CONCURRENT_REQUESTS = 3
let activeRequests = 0
let isProcessingQueue = false

// Process the logo queue with priority
const processLogoQueue = async () => {
  if (isProcessingQueue || logoQueue.length === 0) return
  
  isProcessingQueue = true
  
  while (logoQueue.length > 0 && activeRequests < MAX_CONCURRENT_REQUESTS) {
    // Sort by priority (higher number = higher priority)
    logoQueue.sort((a, b) => b.priority - a.priority)
    
    const batch = logoQueue.splice(0, MAX_CONCURRENT_REQUESTS - activeRequests)
    
    // Process batch concurrently
    const batchPromises = batch.map(async (request) => {
      activeRequests++
      try {
        const url = await fetchLogo(request.domain)
        request.resolve(url)
      } catch (error) {
        request.reject(error instanceof Error ? error : new Error('Failed to fetch logo'))
      } finally {
        activeRequests--
      }
    })
    
    await Promise.all(batchPromises)
    
    // Small delay between batches
    if (logoQueue.length > 0) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
  
  isProcessingQueue = false
}

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

export function useCompanyLogo(domain: string | undefined, name: string, priority: number = 0) {
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
    async (targetDomain: string, targetPriority: number) => {
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

      // Add to priority queue
      const request: LogoRequest = {
        domain: cleaned,
        priority: targetPriority,
        resolve: (url) => {
          // Update cache
          logoCache[cleaned] = {
            url,
            timestamp: Date.now(),
            loading: false,
          }
          setLogoUrl(url)
          setError(null)
          setIsLoading(false)
        },
        reject: (err) => {
          const errorMessage = err.message || "Failed to load logo"
          setError(errorMessage)
          // Cache the error result
          logoCache[cleaned] = {
            url: null,
            timestamp: Date.now(),
            loading: false,
          }
          setIsLoading(false)
        }
      }

      logoQueue.push(request)
      processLogoQueue()
    },
    [cleanDomain],
  )

  useEffect(() => {
    if (domain) {
      loadLogo(domain, priority)
    } else {
      setLogoUrl(null)
      setIsLoading(false)
      setError(null)
    }
  }, [domain, priority, loadLogo])

  // Cleanup cache periodically
  useEffect(() => {
    const interval = setInterval(cleanupCache, 5 * 60 * 1000) // Every 5 minutes
    return () => clearInterval(interval)
  }, [])

  return {
    logoUrl,
    isLoading,
    error,
    retry: () => domain && loadLogo(domain, priority),
  }
}

// Export cache stats for debugging
export const getLogoCacheStats = () => ({
  size: Object.keys(logoCache).length,
  maxSize: MAX_CACHE_SIZE,
  pendingRequests: pendingRequests.size,
})
