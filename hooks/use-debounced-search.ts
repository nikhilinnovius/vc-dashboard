"use client"

import { useState, useEffect, useCallback, useRef } from "react"

export function useDebouncedSearch<T>(searchFunction: (query: string) => T[], delay = 300) {
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [results, setResults] = useState<T[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  // Debounce the search query
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedQuery(query)
    }, delay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [query, delay])

  // Execute search when debounced query changes
  useEffect(() => {
    if (debouncedQuery !== query) {
      setIsSearching(true)
    }

    // Use requestIdleCallback for non-blocking search
    const performSearch = () => {
      try {
        const searchResults = searchFunction(debouncedQuery)
        setResults(searchResults)
      } catch (error) {
        console.error("Search error:", error)
        setResults([])
      } finally {
        setIsSearching(false)
      }
    }

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      window.requestIdleCallback(performSearch, { timeout: 100 })
    } else {
      setTimeout(performSearch, 0)
    }
  }, [debouncedQuery, searchFunction])

  const updateQuery = useCallback(
    (newQuery: string) => {
      setQuery(newQuery)
      if (newQuery !== debouncedQuery) {
        setIsSearching(true)
      }
    },
    [debouncedQuery],
  )

  return {
    query,
    updateQuery,
    results,
    isSearching: isSearching || query !== debouncedQuery,
  }
}
