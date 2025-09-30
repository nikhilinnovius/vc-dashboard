import { sortVCsByPortfolioScore } from "@/lib/data-utils"

export interface FilterOptions {
  type: "state" | "city" | null
  value: string | null
}

export interface Startup {
  id: string
  name: string
  city: string
  state: string
  lastRound?: string
  status?: string
  endMarket?: string
  vcId?: string
}

export interface VC {
  id: string
  name: string
  city: string
  state: string
  portfolioCompanyScore?: number
  aum?: string
  website?: string
  stageDistribution?: any
}

export const filterVCs = (vcs: VC[], filter: FilterOptions): VC[] => {
  if (!vcs) return []

  let filtered = [...vcs]

  if (filter.type && filter.value) {
    const locations = filter.value.split(",").map((loc) => loc.trim())
    filtered = filtered.filter((vc) => {
      if (filter.type === "city") {
        return locations.includes(vc.city)
      }
      if (filter.type === "state") {
        return locations.includes(vc.state)
      }
      return true
    })
  }

  return sortVCsByPortfolioScore(filtered)
}

export const filterStartups = (
  startups: Startup[], 
  filter: FilterOptions, 
  selectedVC?: string | null,
  localEntityType?: "vc" | "startup" | null
): Startup[] => {
  if (!startups) return []

  let filtered = startups

  if (filter.type && filter.value) {
    const locations = filter.value.split(",").map((loc) => loc.trim())
    filtered = filtered.filter((startup) => {
      if (filter.type === "city") {
        return locations.includes(startup.city)
      }
      if (filter.type === "state") {
        return locations.includes(startup.state)
      }
      return true
    })
  }

  if (!selectedVC && localEntityType === "startup") {
    const uniqueStartups = new Map()
    filtered.forEach((startup) => {
      if (!uniqueStartups.has(startup.name)) {
        uniqueStartups.set(startup.name, startup)
      }
    })
    return Array.from(uniqueStartups.values())
  }

  return filtered
}

export const applyAdvancedStartupFilters = (
  startups: Startup[],
  lastRoundFilter?: string | null,
  statusFilter?: string | null,
  endMarketFilters?: string[]
): Startup[] => {
  if (!startups) return []

  let filtered = [...startups]

  if (lastRoundFilter) {
    filtered = filtered.filter((startup) => startup.lastRound === lastRoundFilter)
  }

  if (statusFilter) {
    filtered = filtered.filter((startup) => startup.status === statusFilter)
  }

  if (endMarketFilters && endMarketFilters.length > 0) {
    filtered = filtered.filter((startup) => {
      if (!startup.endMarket) return false
      const startupMarkets = startup.endMarket.split(",").map((market) => market.trim())
      return endMarketFilters.some((filter) => startupMarkets.includes(filter))
    })
  }

  return filtered
}

export const getUniqueValues = (
  startups: Startup[],
  vcId: string,
  field: keyof Startup
): string[] => {
  if (!startups || !Array.isArray(startups)) return []
  
  const vcStartups = startups.filter((startup) => startup.vcId === vcId)
  const uniqueValues = new Set<string>()
  
  vcStartups.forEach((startup) => {
    const value = startup[field]
    if (value && typeof value === 'string' && value.trim()) {
      if (field === 'endMarket') {
        // Handle comma-separated values
        const markets = value.split(",").map((market) => market.trim())
        markets.forEach((market) => {
          if (market) uniqueValues.add(market)
        })
      } else {
        uniqueValues.add(value.trim())
      }
    }
  })
  
  return Array.from(uniqueValues).sort()
}

export const getUniqueLastRounds = (startups: Startup[], vcId: string): string[] => {
  return getUniqueValues(startups, vcId, 'lastRound')
}

export const getUniqueStatuses = (startups: Startup[], vcId: string): string[] => {
  return getUniqueValues(startups, vcId, 'status')
}

export const getUniqueEndMarkets = (startups: Startup[], vcId: string): string[] => {
  return getUniqueValues(startups, vcId, 'endMarket')
}
