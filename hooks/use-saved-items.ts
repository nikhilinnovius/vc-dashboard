import { useState, useEffect, useCallback } from 'react'

interface UseSavedItemsReturn {
  savedVCs: string[]
  savedStartups: string[]
  setSavedVCs: React.Dispatch<React.SetStateAction<string[]>>
  setSavedStartups: React.Dispatch<React.SetStateAction<string[]>>
  fetchSavedVCs: () => Promise<void>
  fetchSavedStartups: () => Promise<void>
  isLoading: boolean
}

export const useSavedItems = (status: string): UseSavedItemsReturn => {
  const [savedVCs, setSavedVCs] = useState<string[]>([])
  const [savedStartups, setSavedStartups] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchSavedVCs = useCallback(async () => {
    try {
      const response = await fetch("/api/vcs/saved", {
        cache: "force-cache",
        next: { revalidate: 60 },
      })
      if (response.ok) {
        const data = await response.json()
        setSavedVCs(Array.isArray(data.savedVCs) ? data.savedVCs : [])
      }
    } catch (error) {
      console.error("Failed to fetch saved VCs:", error)
    }
  }, [])

  const fetchSavedStartups = useCallback(async () => {
    try {
      const response = await fetch("/api/startups/saved", {
        cache: "force-cache",
        next: { revalidate: 60 },
      })
      if (response.ok) {
        const data = await response.json()
        setSavedStartups(Array.isArray(data.savedStartups) ? data.savedStartups : [])
      }
    } catch (error) {
      console.error("Failed to fetch saved startups:", error)
    }
  }, [])

  useEffect(() => {
    if (status === "authenticated") {
      setIsLoading(true)
      Promise.all([fetchSavedVCs(), fetchSavedStartups()]).finally(() => setIsLoading(false))
    }
  }, [status, fetchSavedVCs, fetchSavedStartups])

  return {
    savedVCs,
    savedStartups,
    setSavedVCs,
    setSavedStartups,
    fetchSavedVCs,
    fetchSavedStartups,
    isLoading,
  }
}
