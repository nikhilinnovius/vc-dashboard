import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { VentureData } from '@/lib/data-utils'
import { transformToVentureData } from '@/lib/data-transforms'

interface VcStore {
  // State
  vcs: VentureData[]
  isLoading: boolean
  error: string | null
  totalItems: number
  totalPages: number
  
  // Actions
  setVcs: (vcs: VentureData[]) => void
  addVc: (vc: VentureData) => void
  updateVc: (id: string, updates: Partial<VentureData>) => void
  removeVc: (id: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  fetchVcs: () => Promise<void>
  clearVcs: () => void
  getVcById: (id: string) => VentureData | undefined
  getVcsByLocation: (city?: string, state?: string) => VentureData[]
  searchVcs: (query: string) => VentureData[]
  setMetadata: (totalItems: number, totalPages: number) => void
  getVcsForPage: (page: number, itemsPerPage?: number) => VentureData[]
  getFilteredVcs: (filterType?: "city" | "state" | null, locationFilter?: string | null) => VentureData[]
  getFilteredVcsForPage: (page: number, filterType?: "city" | "state" | null, locationFilter?: string | null, itemsPerPage?: number) => {
    vcs: VentureData[]
    totalItems: number
    totalPages: number
  }
}

export const useVcStore = create<VcStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      vcs: [],
      isLoading: false,
      error: null,
      totalItems: 0,
      totalPages: 0,

      // Actions
      setVcs: (vcs) => 
        set({ vcs }, false, 'setVcs'),

      addVc: (vc) => 
        set((state) => ({ 
          vcs: [...state.vcs, vc],
          totalItems: state.totalItems + 1 
        }), false, 'addVc'),

      updateVc: (id, updates) => 
        set((state) => ({
          vcs: state.vcs.map(vc => 
            vc.id === id ? { ...vc, ...updates } : vc
          )
        }), false, 'updateVc'),

      removeVc: (id) => 
        set((state) => ({
          vcs: state.vcs.filter(vc => vc.id !== id),
          totalItems: Math.max(0, state.totalItems - 1)
        }), false, 'removeVc'),

      setLoading: (loading) => 
        set({ isLoading: loading }, false, 'setLoading'),

      setError: (error) => 
        set({ error }, false, 'setError'),

      clearVcs: () => 
        set({ 
          vcs: [], 
          totalItems: 0, 
          totalPages: 0 
        }, false, 'clearVcs'),

      setMetadata: (totalItems, totalPages) =>
        set({ totalItems, totalPages }, false, 'setMetadata'),

      // Fetch ALL VCs from API at once
      fetchVcs: async () => {
        const { setLoading, setError, setVcs, setMetadata } = get()
        
        console.log('🏢 VcStore: Starting VC fetch...')
        setLoading(true)
        setError(null)
        
        try {
          const startTime = Date.now()
          const response = await fetch('/api/fetch-all-vcs')
          if (!response.ok) {
            throw new Error(`Failed to fetch VCs: ${response.statusText}`)
          }
          
          const data = await response.json()
          console.log('🔍 VcStore: Raw API response:', { 
            vcsCount: data.vcs?.length, 
            totalItems: data.totalItems,
            firstVC: data.vcs?.[0] 
          })
          
          const transformedVcs = data.vcs.map((vc: any) => transformToVentureData(vc)) || []
          console.log('🔍 VcStore: Transformed VCs:', { 
            count: transformedVcs.length, 
            firstTransformed: transformedVcs[0] 
          })
          
          setVcs(transformedVcs)
          setMetadata(data.totalItems || 0, data.totalPages || 0)
          
          const endTime = Date.now()
          console.log(`✅ VcStore: Loaded ${transformedVcs.length} VCs in ${endTime - startTime}ms`)
        } catch (error) {
          console.error('❌ VcStore: Error fetching VCs:', error)
          setError(error instanceof Error ? error.message : 'Failed to fetch VCs')
        } finally {
          setLoading(false)
        }
      },

      // Utility selectors
      getVcById: (id) => {
        return get().vcs.find(vc => vc.id === id)
      },

      getVcsByLocation: (city, state) => {
        const { vcs } = get()
        return vcs.filter(vc => {
          const matchesCity = !city || vc.city?.toLowerCase().includes(city.toLowerCase())
          const matchesState = !state || vc.state?.toLowerCase().includes(state.toLowerCase())
          return matchesCity && matchesState
        })
      },

      searchVcs: (query) => {
        const { vcs } = get()
        const lowerQuery = query.toLowerCase()
        return vcs.filter(vc => 
          vc.name.toLowerCase().includes(lowerQuery) ||
          vc.description?.toLowerCase().includes(lowerQuery) ||
          vc.city?.toLowerCase().includes(lowerQuery) ||
          vc.state?.toLowerCase().includes(lowerQuery) ||
          vc.website?.toLowerCase().includes(lowerQuery)
        )
      },

      // Get VCs for a specific page (frontend pagination)
      getVcsForPage: (page, itemsPerPage = 20) => {
        const { vcs } = get()
        const startIndex = (page - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        return vcs.slice(startIndex, endIndex)
      },

      // Get filtered VCs based on location filters
      getFilteredVcs: (filterType, locationFilter) => {
        const { vcs } = get()
        let filtered = [...vcs]
        
        console.log('🔍 getFilteredVcs called with:', { 
          filterType, 
          locationFilter, 
          vcsCount: vcs.length,
          locationFilterTruthy: !!locationFilter,
          locationFilterValue: locationFilter
        })
        
        if (locationFilter && locationFilter.trim()) {
          const locations = locationFilter.split(",").map((loc) => loc.trim())
          console.log('📍 Filtering by locations:', locations)
          
          filtered = filtered.filter((vc) => {
            // Match if location appears in either city or state field
            const matches = locations.some(location => 
              (vc.city && vc.city === location) ||
              (vc.state && vc.state === location)
            )
            return matches
          })
          
          console.log('🎯 Filtered VCs count:', filtered.length)
        } else {
          console.log('⚡ No location filter applied, returning all VCs')
        }
        
        return filtered
      },

      // Get filtered VCs for a specific page with pagination metadata
      getFilteredVcsForPage: (page, filterType, locationFilter, itemsPerPage = 20) => {
        const { getFilteredVcs } = get()
        const filteredVcs = getFilteredVcs(filterType, locationFilter)
        
        const totalItems = filteredVcs.length
        const totalPages = Math.ceil(totalItems / itemsPerPage)
        const startIndex = (page - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        const vcs = filteredVcs.slice(startIndex, endIndex)
        
        return {
          vcs,
          totalItems,
          totalPages
        }
      }
    }),
    {
      name: 'vc-store',
    }
  )
)
