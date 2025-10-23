import { transformToStartupData } from '@/lib/data-transforms'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { frontendToBackendRoundMap } from '@/lib/round-mapping'

// Startup/Company interface based on existing types
export interface Startup {
  // Basic Info
  id?: string
  name: string
  website: string | null
  linkedin?: string
  city: string | null
  state: string | null
  domain?: string
  
  // Status & Scoring
  status?: string
  companyScore?: string | number
  companyStatus?: string
  raisePredictor?: string
  scoreReasoning?: string
  
  // Funding Information
  lastRound?: string
  lastFundingAmount?: string | number
  totalRaised?: string | number
  recentFunding?: string
  expectedRaise?: string
  
  // Company Details
  foundedDate?: string
  startupTotalEmployees?: string | number
  totalEmployees?: number
  summary?: string
  description?: string
  businessModel?: string
  endMarket?: string
  subVertical?: string
  
  // Leadership
  ceoLinkedin?: string
  
  // Connections & Coverage
  flaggedBy?: string
  flaggedByInternalAndExternal?: string
  currentInvestors?: string | string[]
  innoviusInvestorConnections?: string
  innoviusCoverage?: string
  startupExcitement?: string
  excitement?: string
  connectedWithCompany?: string
  innoviusConnected?: boolean
  
  // Growth Metrics
  headcount180d?: string
  headcount1y?: string
  headcount180dPct?: number
  headcount1yPct?: number
  sales1y?: string
  sales1yPct?: number
  webTraffic1y?: string
  webTraffic1yPct?: number
  webTraffic180d?: string
  webTraffic180dPct?: number
  salesGrowth180d?: string
  sales180dPct?: number
  
  // Additional
  conferences?: string
  vcId?: string
  inAffinity?: boolean
  organizationId?: number
  workflowTriggers?: string
  offshoreData?: string
  mostRecentFunding?: string
}

interface StartupStore {
  // State
  startups: Startup[]
  isLoading: boolean
  error: string | null
  totalItems: number
  totalPages: number
  vcStartups: Record<string, Startup[]> // Cache for VC-specific startups
  vcStartupsLoading: Record<string, boolean> // Loading state for each VC
  
  // Actions
  setStartups: (startups: Startup[]) => void
  addStartup: (startup: Startup) => void
  updateStartup: (identifier: string, updates: Partial<Startup>) => void
  removeStartup: (identifier: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  fetchStartups: () => Promise<void>
  fetchStartupsForVC: (vcId: string) => Promise<void>
  clearStartups: () => void
  getStartupById: (id: string) => Startup | undefined
  getStartupByName: (name: string) => Startup | undefined
  getStartupsByLocation: (city?: string, state?: string) => Startup[]
  getStartupsByVC: (vcId: string) => Startup[]
  searchStartups: (query: string) => Startup[]
  setMetadata: (totalItems: number, totalPages: number) => void
  getStartupsByEndMarket: (endMarket: string) => Startup[]
  getStartupsByStatus: (status: string) => Startup[]
  getStartupsForPage: (page: number, itemsPerPage?: number) => Startup[]
  getFilteredStartups: (filterType?: "city" | "state" | null, locationFilter?: string | null, roundFilters?: string[], statusFilters?: string[], endMarketFilters?: string[]) => Startup[]
  getFilteredStartupsForPage: (page: number, filterType?: "city" | "state" | null, locationFilter?: string | null, roundFilters?: string[], statusFilters?: string[], endMarketFilters?: string[], itemsPerPage?: number) => {
    startups: Startup[]
    totalItems: number
    totalPages: number
  }
}

export const useStartupStore = create<StartupStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      startups: [],
      isLoading: false,
      error: null,
      totalItems: 0,
      totalPages: 0,
      vcStartups: {},
      vcStartupsLoading: {},

      // Actions
      setStartups: (startups) => 
        set({ startups }, false, 'setStartups'),

      addStartup: (startup) => 
        set((state) => ({ 
          startups: [...state.startups, startup],
          totalItems: state.totalItems + 1 
        }), false, 'addStartup'),

      updateStartup: (identifier, updates) => 
        set((state) => ({
          startups: state.startups.map(startup => {
            // Match by id, name, or domain
            const matches = startup.id === identifier || 
                          startup.name === identifier ||
                          startup.domain === identifier
            return matches ? { ...startup, ...updates } : startup
          })
        }), false, 'updateStartup'),

      removeStartup: (identifier) => 
        set((state) => ({
          startups: state.startups.filter(startup => 
            startup.id !== identifier && 
            startup.name !== identifier &&
            startup.domain !== identifier
          ),
          totalItems: Math.max(0, state.totalItems - 1)
        }), false, 'removeStartup'),

      setLoading: (loading) => 
        set({ isLoading: loading }, false, 'setLoading'),

      setError: (error) => 
        set({ error }, false, 'setError'),

      clearStartups: () => 
        set({ 
          startups: [], 
          totalItems: 0, 
          totalPages: 0 
        }, false, 'clearStartups'),

      setMetadata: (totalItems, totalPages) =>
        set({ totalItems, totalPages }, false, 'setMetadata'),

      // Fetch startups from API
      fetchStartups: async () => {
        const { setLoading, setError, setStartups, setMetadata } = get()
        
        console.log('🚀 StartupStore: Starting startup fetch...')
        setLoading(true)
        setError(null)
        
        try {
          const startTime = Date.now()
          const response = await fetch('/api/fetch-all-companies')
          if (!response.ok) {
            throw new Error(`Failed to fetch startups: ${response.statusText}`)
          }
          
          const data = await response.json()
          const transformedStartups = (data.companies || []).map((startup: any) => transformToStartupData(startup))
          
          setStartups(transformedStartups)
          setMetadata(data.totalItems || 0, data.totalPages || 0)
          
          const endTime = Date.now()
          console.log(`✅ StartupStore: Loaded ${transformedStartups.length} startups in ${endTime - startTime}ms`)
        } catch (error) {
          console.error('❌ StartupStore: Error fetching startups:', error)
          setError(error instanceof Error ? error.message : 'Failed to fetch startups')
        } finally {
          setLoading(false)
        }
      },

      // Fetch startups for a specific VC
      fetchStartupsForVC: async (vcId: string) => {
        const state = get()
        
        // Set loading state for this specific VC
        set((state) => ({
          vcStartupsLoading: { ...state.vcStartupsLoading, [vcId]: true }
        }), false, 'setVCStartupsLoading')
        
        try {
          const response = await fetch(`/api/fetch-startups/${vcId}`)
          if (!response.ok) {
            throw new Error(`Failed to fetch startups for VC: ${response.statusText}`)
          }
          
          const data = await response.json()
          const startups = data.startups.map((startup: any) => ({
            ...transformToStartupData(startup),
            vcId: vcId // Ensure vcId is set
          })) || []
          
          // Cache the results for this VC
          set((state) => ({
            vcStartups: { ...state.vcStartups, [vcId]: startups },
            vcStartupsLoading: { ...state.vcStartupsLoading, [vcId]: false }
          }), false, 'setVCStartups')
          
        } catch (error) {
          set((state) => ({
            vcStartupsLoading: { ...state.vcStartupsLoading, [vcId]: false }
          }), false, 'setVCStartupsLoadingError')
          throw error
        }
      },

      // Utility selectors
      getStartupById: (id) => {
        const { startups } = get()
        return startups.find(startup => startup.id === id)
      },

      getStartupByName: (name) => {
        return get().startups.find(startup => 
          startup.name.toLowerCase() === name.toLowerCase()
        )
      },

      getStartupsByLocation: (city, state) => {
        const { startups } = get()
        return startups.filter(startup => {
          const matchesCity = !city || startup.city?.toLowerCase().includes(city.toLowerCase())
          const matchesState = !state || startup.state?.toLowerCase().includes(state.toLowerCase())
          return matchesCity && matchesState
        })
      },

      getStartupsByVC: (vcId) => {
        const { vcStartups } = get()
        return vcStartups[vcId] || []
      },

      getStartupsByEndMarket: (endMarket) => {
        const { startups } = get()
        return startups.filter(startup => 
          startup.endMarket?.toLowerCase().includes(endMarket.toLowerCase())
        )
      },

      getStartupsByStatus: (status) => {
        const { startups } = get()
        return startups.filter(startup => 
          startup.status?.toLowerCase() === status.toLowerCase() ||
          startup.companyStatus?.toLowerCase() === status.toLowerCase()
        )
      },

      searchStartups: (query) => {
        const { startups } = get()
        const lowerQuery = query.toLowerCase()
        return startups.filter(startup => 
          startup.name.toLowerCase().includes(lowerQuery) ||
          startup.description?.toLowerCase().includes(lowerQuery) ||
          startup.summary?.toLowerCase().includes(lowerQuery) ||
          startup.city?.toLowerCase().includes(lowerQuery) ||
          startup.state?.toLowerCase().includes(lowerQuery) ||
          startup.website?.toLowerCase().includes(lowerQuery) ||
          startup.endMarket?.toLowerCase().includes(lowerQuery) ||
          startup.businessModel?.toLowerCase().includes(lowerQuery) ||
          startup.subVertical?.toLowerCase().includes(lowerQuery)
        )
      },

      // Get startups for a specific page (frontend pagination)
      getStartupsForPage: (page, itemsPerPage = 50) => {
        const { startups } = get()
        const startIndex = (page - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        return startups.slice(startIndex, endIndex)
      },

      // Get filtered startups based on multiple filter criteria
      getFilteredStartups: (filterType, locationFilter, roundFilters = [], statusFilters = [], endMarketFilters = []) => {
        const { startups } = get()
        let filtered = [...startups]
        
        // Apply location filters - check both city and state fields
        if (locationFilter) {
          const locations = locationFilter.split(",").map((loc) => loc.trim())
          filtered = filtered.filter((startup) => {
            // Match if location appears in either city or state field
            return locations.some(location => 
              (startup.city && startup.city === location) ||
              (startup.state && startup.state === location)
            )
          })
        }

        // Map roundFilters to backend format
        let backendRoundFilters = roundFilters.map((round) => {
          return frontendToBackendRoundMap[round]
        })
        
        console.log('🔍 Round filtering debug:', {
          originalRoundFilters: roundFilters,
          backendRoundFilters: backendRoundFilters,
          frontendToBackendRoundMap: frontendToBackendRoundMap,
          sampleStartupLastRounds: filtered.slice(0, 5).map(s => s.lastRound)
        })
        
        // Apply round filters
        if (backendRoundFilters.length > 0) {
          const beforeFilterCount = filtered.length
          filtered = filtered.filter(startup => 
            backendRoundFilters.includes(startup.lastRound || '')
          )
          console.log('🎯 Round filter results:', {
            beforeCount: beforeFilterCount,
            afterCount: filtered.length,
            backendRoundFilters,
            matchedStartups: filtered.slice(0, 3).map(s => ({ name: s.name, lastRound: s.lastRound }))
          })
        }

        // Apply status filters
        if (statusFilters.length > 0) {
          filtered = filtered.filter(startup => 
            statusFilters.includes(startup.companyStatus || '') ||
            statusFilters.includes(startup.status || '')
          )
        }

        // Apply end market filters
        if (endMarketFilters.length > 0) {
          filtered = filtered.filter(startup => 
            endMarketFilters.includes(startup.endMarket || '')
          )
        }
        
        return filtered
      },

      // Get filtered startups for a specific page with pagination metadata
      getFilteredStartupsForPage: (page, filterType, locationFilter, roundFilters = [], statusFilters = [], endMarketFilters = [], itemsPerPage = 50) => {
        const { getFilteredStartups } = get()
        const filteredStartups = getFilteredStartups(filterType, locationFilter, roundFilters, statusFilters, endMarketFilters)
        
        const totalItems = filteredStartups.length
        const totalPages = Math.ceil(totalItems / itemsPerPage)
        const startIndex = (page - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        const startups = filteredStartups.slice(startIndex, endIndex)
        
        return {
          startups,
          totalItems,
          totalPages
        }
      }
    }),
    {
      name: 'startup-store',
    }
  )
)

