"use client"

import { useState, useEffect, useCallback, useRef } from "react"

interface LogoQueueItem {
  domain: string
  name: string
  priority: number
  resolve: (url: string | null) => void
  reject: (error: Error) => void
}

interface LogoCache {
  [domain: string]: {
    url: string | null
    timestamp: number
    loading: boolean
  }
}

// Global queue and cache for managing logo loading
const logoQueue: LogoQueueItem[] = []
const logoCache: LogoCache = {}
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes
const MAX_CONCURRENT_REQUESTS = 3
const BATCH_DELAY = 100 // ms between batches

let isProcessing = false
let activeRequests = 0

// Process the logo queue with priority and concurrency control
const processQueue = async () => {
  if (isProcessing || logoQueue.length === 0) return
  
  isProcessing = true
  
  while (logoQueue.length > 0 && activeRequests < MAX_CONCURRENT_REQUESTS) {
    // Sort by priority (higher number = higher priority)
    logoQueue.sort((a, b) => b.priority - a.priority)
    
    const batch = logoQueue.splice(0, MAX_CONCURRENT_REQUESTS - activeRequests)
    
    // Process batch concurrently
    const batchPromises = batch.map(async (item) => {
      activeRequests++
      try {
        const url = await fetchLogoWithRetry(item.domain)
        item.resolve(url)
      } catch (error) {
        item.reject(error instanceof Error ? error : new Error('Failed to fetch logo'))
      } finally {
        activeRequests--
      }
    })
    
    await Promise.all(batchPromises)
    
    // Small delay between batches to prevent overwhelming the system
    if (logoQueue.length > 0) {
      await new Promise(resolve => setTimeout(resolve, BATCH_DELAY))
    }
  }
  
  isProcessing = false
}

// Fetch logo with retry logic
const fetchLogoWithRetry = async (domain: string, retries = 2): Promise<string | null> => {
  if (!domain) return null

  // Check local cache first
  const cached = logoCache[domain]
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.url
  }

  // Mark as loading in cache
  logoCache[domain] = {
    url: null,
    timestamp: Date.now(),
    loading: true,
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`/api/logos/${encodeURIComponent(domain)}`, {
        cache: "force-cache",
        next: { revalidate: 3600 },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      const url = data.url || null

      // Update local cache
      logoCache[domain] = {
        url,
        timestamp: Date.now(),
        loading: false,
      }

      return url
    } catch (error) {
      console.warn(`Logo fetch attempt ${attempt + 1} failed for ${domain}:`, error)
      
      if (attempt === retries) {
        // Final attempt failed
        logoCache[domain] = {
          url: null,
          timestamp: Date.now(),
          loading: false,
        }
        return null
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
    }
  }

  return null
}

// Hook for priority-based logo loading
export function usePriorityLogoLoading(domain: string | undefined, name: string, priority: number = 0) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)

  const loadLogo = useCallback(async (targetDomain: string, targetPriority: number) => {
    if (!targetDomain || !mountedRef.current) return

    // Check cache first
    const cached = logoCache[targetDomain]
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      if (mountedRef.current) {
        setLogoUrl(cached.url)
        setIsLoading(cached.loading)
        setError(null)
      }
      return
    }

    if (cached?.loading) {
      // Already loading, wait for it
      return
    }

    setIsLoading(true)
    setError(null)

    // Add to queue with priority
    const queueItem: LogoQueueItem = {
      domain: targetDomain,
      name,
      priority: targetPriority,
      resolve: (url) => {
        if (mountedRef.current) {
          setLogoUrl(url)
          setIsLoading(false)
          setError(null)
        }
      },
      reject: (err) => {
        if (mountedRef.current) {
          setError(err.message)
          setIsLoading(false)
        }
      }
    }

    logoQueue.push(queueItem)
    
    // Process queue
    processQueue()
  }, [name])

  useEffect(() => {
    if (domain) {
      loadLogo(domain, priority)
    } else {
      setLogoUrl(null)
      setIsLoading(false)
      setError(null)
    }
  }, [domain, priority, loadLogo])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  return {
    logoUrl,
    isLoading,
    error,
    retry: () => domain && loadLogo(domain, priority),
  }
}

// Hook for preloading logos for next page
export function useLogoPreloader() {
  const preloadLogos = useCallback(async (domains: string[]) => {
    const promises = domains.map(domain => 
      fetchLogoWithRetry(domain).catch(() => null)
    )
    
    await Promise.allSettled(promises)
  }, [])

  return { preloadLogos }
}

// Export cache stats for debugging
export const getLogoQueueStats = () => ({
  queueLength: logoQueue.length,
  activeRequests,
  cacheSize: Object.keys(logoCache).length,
  isProcessing,
})
