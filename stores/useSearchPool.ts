import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { useVcStore } from './useVcStore'
import { useStartupStore, type Startup } from './useStartupStore'
import { useEffect, useMemo } from 'react'
import type { VentureData } from '@/lib/data-utils'

// Unified search item interface
export interface SearchItem {
  entityType: "vc" | "company"
  id: string
  name: string
  website: string | null
  city: string | null
  state: string | null
}

interface SearchPoolStore {
  // State
  searchPool: SearchItem[]
  isInitialized: boolean
  lastSyncTimestamp: number
  
  // Actions
  initializePool: () => void
  updatePool: (vcs: VentureData[], startups: Startup[]) => void
  clearPool: () => void
  search: (query: string) => SearchItem[]
  searchByLocation: (city?: string, state?: string) => SearchItem[]
  searchByEntityType: (entityType: "vc" | "company") => SearchItem[]
  findById: (id: string, entityType?: "vc" | "company") => SearchItem | undefined
}

// Helper function to convert VC to SearchItem
function vcToSearchItem(vc: VentureData): SearchItem {
  return {
    entityType: "vc",
    id: vc.id,
    name: vc.name,
    website: vc.website || null,
    city: vc.city || null,
    state: vc.state || null
  }
}

// Helper function to convert Startup to SearchItem
function startupToSearchItem(startup: Startup): SearchItem {
  return {
    entityType: "company",
    id: startup.id || `startup-${startup.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    name: startup.name,
    website: startup.website || null,
    city: startup.city || null,
    state: startup.state || null
  }
}

export const useSearchPool = create<SearchPoolStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      searchPool: [],
      isInitialized: false,
      lastSyncTimestamp: 0,

      // Initialize search pool from current store data
      initializePool: () => {
        const vcStore = useVcStore.getState()
        const startupStore = useStartupStore.getState()
        
        const { updatePool } = get()
        updatePool(vcStore.vcs, startupStore.startups)
      },

      // Update the search pool with new data
      updatePool: (vcs, startups) => {
        const vcItems = vcs.map(vcToSearchItem)
        const startupItems = startups.map(startupToSearchItem)
        const searchPool = [...vcItems, ...startupItems]
        
        set({
          searchPool,
          isInitialized: true,
          lastSyncTimestamp: Date.now()
        }, false, 'updatePool')
      },

      // Clear the search pool
      clearPool: () => 
        set({
          searchPool: [],
          isInitialized: false,
          lastSyncTimestamp: 0
        }, false, 'clearPool'),

      // Search across all items
      search: (query) => {
        const { searchPool } = get()
        if (!query.trim()) return searchPool
        
        const lowerQuery = query.toLowerCase()
        return searchPool.filter(item =>
          item.name.toLowerCase().includes(lowerQuery) ||
          item.website?.toLowerCase().includes(lowerQuery) ||
          item.city?.toLowerCase().includes(lowerQuery) ||
          item.state?.toLowerCase().includes(lowerQuery)
        )
      },

      // Search by location
      searchByLocation: (city, state) => {
        const { searchPool } = get()
        return searchPool.filter(item => {
          const matchesCity = !city || item.city?.toLowerCase().includes(city.toLowerCase())
          const matchesState = !state || item.state?.toLowerCase().includes(state.toLowerCase())
          return matchesCity && matchesState
        })
      },

      // Filter by entity type
      searchByEntityType: (entityType) => {
        const { searchPool } = get()
        return searchPool.filter(item => item.entityType === entityType)
      },

      // Find item by ID
      findById: (id, entityType) => {
        const { searchPool } = get()
        return searchPool.find(item => 
          item.id === id && (!entityType || item.entityType === entityType)
        )
      }
    }),
    {
      name: 'search-pool-store',
    }
  )
)

// Hook for auto-syncing search pool with underlying stores
export function useSearchPoolSync() {
  const { vcs, isLoading: vcLoading } = useVcStore()
  const { startups, isLoading: startupLoading } = useStartupStore()
  const { searchPool, isInitialized, updatePool, lastSyncTimestamp } = useSearchPool()

  // Auto-sync when underlying data changes
  useEffect(() => {
    if (!vcLoading && !startupLoading && (vcs.length > 0 || startups.length > 0)) {
      updatePool(vcs, startups)
    }
  }, [vcs, startups, vcLoading, startupLoading, updatePool])

  return {
    searchItems: searchPool,
    isInitialized,
    isLoading: vcLoading || startupLoading,
    lastSyncTimestamp,
    totalItems: searchPool.length,
    vcCount: searchPool.filter(item => item.entityType === "vc").length,
    companyCount: searchPool.filter(item => item.entityType === "company").length
  }
}

// Hook for global search utilities
export function useGlobalSearch() {
  const { search, searchByLocation, searchByEntityType, findById } = useSearchPool()
  const { searchItems, isInitialized } = useSearchPoolSync()

  // Memoized search functions for better performance
  const searchUtilities = useMemo(() => ({
    // Basic search
    search: (query: string) => {
      if (!isInitialized) return []
      return search(query)
    },

    // Location-based search
    searchByLocation: (city?: string, state?: string) => {
      if (!isInitialized) return []
      return searchByLocation(city, state)
    },

    // Entity type search
    searchVCs: () => {
      if (!isInitialized) return []
      return searchByEntityType("vc")
    },

    searchCompanies: () => {
      if (!isInitialized) return []
      return searchByEntityType("company")
    },

    // Find by ID
    findById: (id: string, entityType?: "vc" | "company") => {
      if (!isInitialized) return undefined
      return findById(id, entityType)
    },

    // Combined search with filters
    searchWithFilters: (query: string, options: {
      entityType?: "vc" | "company"
      city?: string
      state?: string
      limit?: number
    } = {}) => {
      if (!isInitialized) return []
      
      let results = search(query)
      
      if (options.entityType) {
        results = results.filter(item => item.entityType === options.entityType)
      }
      
      if (options.city || options.state) {
        results = results.filter(item => {
          const matchesCity = !options.city || item.city?.toLowerCase().includes(options.city.toLowerCase())
          const matchesState = !options.state || item.state?.toLowerCase().includes(options.state.toLowerCase())
          return matchesCity && matchesState
        })
      }
      
      if (options.limit) {
        results = results.slice(0, options.limit)
      }
      
      return results
    }
  }), [search, searchByLocation, searchByEntityType, findById, isInitialized])

  return {
    ...searchUtilities,
    isInitialized,
    totalItems: searchItems.length
  }
}