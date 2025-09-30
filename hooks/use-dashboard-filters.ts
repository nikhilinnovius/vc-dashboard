import { useState, useMemo, useCallback } from 'react'

interface FilterState {
  type: "state" | "city" | null
  value: string | null
}

interface UseDashboardFiltersProps {
  startups: any[]
  vcs: any[]
  filterType: string | null
  locationFilter: string | null
  selectedVC: string | null
  localEntityType: "vc" | "startup" | null
}

interface UseDashboardFiltersReturn {
  filteredVCs: any[]
  filteredStartups: any[]
  fullyFilteredStartupsCount: number
  savedStartupsCount: number
  lastRoundFilter: string | null
  statusFilter: string | null
  endMarketFilters: string[]
  setLastRoundFilter: (filter: string | null) => void
  setStatusFilter: (filter: string | null) => void
  setEndMarketFilters: (filters: string[]) => void
  getUniqueLastRounds: (vcId: string) => string[]
  getUniqueStatuses: (vcId: string) => string[]
  getUniqueEndMarkets: (vcId: string) => string[]
  clearFilters: () => void
}

export const useDashboardFilters = ({
  startups,
  vcs,
  filterType,
  locationFilter,
  selectedVC,
  localEntityType,
}: UseDashboardFiltersProps): UseDashboardFiltersReturn => {
  const [lastRoundFilter, setLastRoundFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [endMarketFilters, setEndMarketFilters] = useState<string[]>([])

  const filteredVCs = useMemo(() => {
    if (!vcs) return []

    let filtered = [...vcs]

    if (filterType && locationFilter) {
      const locations = locationFilter.split(",").map((loc) => loc.trim())
      filtered = filtered.filter((vc) => {
        if (filterType === "city") {
          return locations.includes(vc.city)
        }
        if (filterType === "state") {
          return locations.includes(vc.state)
        }
        return true
      })
    }

    return filtered
  }, [vcs, filterType, locationFilter])

  const filteredStartups = useMemo(() => {
    if (!startups) return []

    let filtered = startups

    if (filterType && locationFilter) {
      const locations = locationFilter.split(",").map((loc) => loc.trim())
      filtered = filtered.filter((startup) => {
        if (filterType === "city") {
          return locations.includes(startup.city)
        }
        if (filterType === "state") {
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
  }, [startups, filterType, locationFilter, selectedVC, localEntityType])

  const fullyFilteredStartupsCount = useMemo(() => {
    if (!filteredStartups) return 0

    let filtered = [...filteredStartups]

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

    return filtered.length
  }, [filteredStartups, lastRoundFilter, statusFilter, endMarketFilters])

  const savedStartupsCount = useMemo(() => {
    if (!filteredStartups) return 0
    // This would need savedStartups from props or context
    return 0 // Placeholder
  }, [filteredStartups])

  const getUniqueLastRounds = useCallback(
    (vcId: string) => {
      if (!startups || !Array.isArray(startups)) return []
      const vcStartups = startups.filter((startup) => startup.vcId === vcId)
      const uniqueRounds = new Set<string>()
      vcStartups.forEach((startup) => {
        if (startup.lastRound && startup.lastRound.trim()) {
          uniqueRounds.add(startup.lastRound.trim())
        }
      })
      return Array.from(uniqueRounds).sort()
    },
    [startups],
  )

  const getUniqueStatuses = useCallback(
    (vcId: string) => {
      if (!startups || !Array.isArray(startups)) return []
      const vcStartups = startups.filter((startup) => startup.vcId === vcId)
      const uniqueStatuses = new Set<string>()
      vcStartups.forEach((startup) => {
        if (startup.status && startup.status.trim()) {
          uniqueStatuses.add(startup.status.trim())
        }
      })
      return Array.from(uniqueStatuses).sort()
    },
    [startups],
  )

  const getUniqueEndMarkets = useCallback(
    (vcId: string) => {
      if (!startups || !Array.isArray(startups)) return []
      const vcStartups = startups.filter((startup) => startup.vcId === vcId)
      const uniqueMarkets = new Set<string>()
      vcStartups.forEach((startup) => {
        if (startup.endMarket && startup.endMarket.trim()) {
          const markets = startup.endMarket.split(",").map((market) => market.trim())
          markets.forEach((market) => {
            if (market) uniqueMarkets.add(market)
          })
        }
      })
      return Array.from(uniqueMarkets).sort()
    },
    [startups],
  )

  const clearFilters = useCallback(() => {
    setLastRoundFilter(null)
    setStatusFilter(null)
    setEndMarketFilters([])
  }, [])

  return {
    filteredVCs,
    filteredStartups,
    fullyFilteredStartupsCount,
    savedStartupsCount,
    lastRoundFilter,
    statusFilter,
    endMarketFilters,
    setLastRoundFilter,
    setStatusFilter,
    setEndMarketFilters,
    getUniqueLastRounds,
    getUniqueStatuses,
    getUniqueEndMarkets,
    clearFilters,
  }
}
