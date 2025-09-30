"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
// import { fetchCSVData, type VCData, type StartupData, getLocations } from "@/lib/data-utils"
// import { sortVCsByPortfolioScore } from "@/lib/data-transforms"
import { getSearchIndex } from "@/lib/search-index"


interface DataContextType {
  vcs: VCData[]
  startups: StartupData[]
  nonQualifiedStartups: any[]
  giveawayData: any[]
  locations: {
    states: string[]
    cities: string[]
  }
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  hasInitialData: boolean
}

const DataContext = createContext<DataContextType | undefined>(undefined)

// Create a singleton data manager with non-blocking loading
class DataManager {
  private static instance: DataManager
  private data: any = null
  private loading = false
  private error: string | null = null
  private subscribers = new Set<() => void>()
  private hasInitialData = false

  static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager()
    }
    return DataManager.instance
  }

  subscribe(callback: () => void) {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback)
  }

  private notify() {
    this.subscribers.forEach((callback) => callback())
  }

  // Non-blocking background data loading
  async loadDataInBackground(force = false) {
    if (this.data && !force) {
      return this.data
    }

    if (this.loading) {
      return this.data
    }

    this.loading = true
    this.error = null
    this.notify()

    try {
      // Use requestIdleCallback for non-blocking processing
      const rawData = await this.loadDataWithIdleCallback()

      // Process data with optimizations
      const vcsWithScores = sortVCsByPortfolioScore(rawData.vcs)
      const allData = [...rawData.vcs, ...rawData.startups]
      const locations = getLocations(allData)

      this.data = {
        vcs: vcsWithScores,
        startups: rawData.startups,
        nonQualifiedStartups: rawData.nonQualifiedStartups || [],
        giveawayData: rawData.giveawayData || [],
        locations,
      }

      this.hasInitialData = true
      this.loading = false
      this.notify()

      // Build search index in the background after data is loaded
      this.buildSearchIndexInBackground()

      return this.data
    } catch (err) {
      console.error("Failed to load data:", err)
      this.error = err instanceof Error ? err.message : "Failed to load data"
      this.loading = false
      this.notify()
      throw err
    }
  }

  private async buildSearchIndexInBackground() {
    if (!this.data) return

    // Build search index in the background without blocking UI
    const buildIndex = () => {
      const searchIndex = getSearchIndex()
      if (!searchIndex.isIndexBuilt()) {
        searchIndex.buildIndex(this.data.vcs, this.data.startups)
      }
    }

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      window.requestIdleCallback(buildIndex, { timeout: 2000 })
    } else {
      setTimeout(buildIndex, 100)
    }
  }

  private async loadDataWithIdleCallback(): Promise<any> {
    return new Promise((resolve, reject) => {
      // Use setTimeout as fallback for requestIdleCallback
      const loadData = () => {
        fetchCSVData().then(resolve).catch(reject)
      }

      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        window.requestIdleCallback(loadData, { timeout: 1000 })
      } else {
        setTimeout(loadData, 0)
      }
    })
  }

  getData() {
    return {
      data: this.data,
      loading: this.loading,
      error: this.error,
      hasInitialData: this.hasInitialData,
    }
  }

  clearData() {
    this.data = null
    this.error = null
    this.hasInitialData = false
    // Clear search index when data is cleared
    const searchIndex = getSearchIndex()
    if (searchIndex.isIndexBuilt()) {
      // Reset the search index
      searchIndex.buildIndex([], [])
    }
    this.notify()
  }

  // Start background loading without blocking
  startBackgroundLoading() {
    if (!this.data && !this.loading) {
      this.loadDataInBackground().catch(console.error)
    }
  }
}

const dataManager = DataManager.getInstance()

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(() => dataManager.getData())

  useEffect(() => {
    const unsubscribe = dataManager.subscribe(() => {
      setState(dataManager.getData())
    })

    // OPTIMIZATION: Don't auto-load CSV data on mount
    // VCs are loaded via paginated /api/vcs endpoint
    // Only load full data when specifically needed (search, individual VC details)

    return unsubscribe
  }, [])

  const refetch = useCallback(async () => {
    try {
      await dataManager.loadDataInBackground(true)
    } catch (error) {
      console.error("Refetch failed:", error)
    }
  }, [])

  const contextValue: DataContextType = {
    vcs: state.data?.vcs || [],
    startups: state.data?.startups || [],
    nonQualifiedStartups: state.data?.nonQualifiedStartups || [],
    giveawayData: state.data?.giveawayData || [],
    locations: state.data?.locations || { states: [], cities: [] },
    isLoading: state.loading,
    error: state.error,
    hasInitialData: state.hasInitialData,
    refetch,
  }

  return <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}

// Export the data manager for advanced usage
export { dataManager }
