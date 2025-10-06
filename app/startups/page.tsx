"use client"

import { useState, useEffect, useMemo } from "react"
import { useURLState } from "@/hooks/use-url-state"
import { GridView } from "@/components/vc-dashboard/core/GridView"
import { FilterForStartups } from "@/components/vc-dashboard/filter/FilterForStartups"
import { useStartupStore } from "@/stores"
import { LogoDebugger } from "@/components/LogoDebugger"

export default function StartupsPage() {
  const { 
    page: urlPage, 
    updateURL, 
    locationFilter, 
    filterType,
    rounds,
    endMarkets,
    companyStatuses
  } = useURLState()
  
  // Use StartupStore for all data management
  const { 
    startups, 
    isLoading, 
    error, 
    totalItems, 
    totalPages,
    getFilteredStartupsForPage
  } = useStartupStore()

  // State for additional filters from FilterForStartups component
  const [additionalFilters, setAdditionalFilters] = useState<{
    rounds: string[]
    endMarkets: string[]
    companyStatuses: string[]
  }>(() => ({
    rounds: rounds ? rounds.split(',').map(r => r.trim()) : [],
    endMarkets: endMarkets ? endMarkets.split(',').map(m => m.trim()) : [],
    companyStatuses: companyStatuses ? companyStatuses.split(',').map(s => s.trim()) : []
  }))

  const page = useMemo(() => {
    const parsedPage = urlPage ? parseInt(urlPage, 10) : 1
    return isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage
  }, [urlPage])

  // Get filtered startups with pagination using store method
  const { 
    startups: displayedStartups, 
    totalItems: filteredTotalItems, 
    totalPages: filteredTotalPages 
  } = useMemo(() => {
    const result = getFilteredStartupsForPage(
      page, 
      filterType, 
      locationFilter, 
      additionalFilters.rounds,
      additionalFilters.companyStatuses,
      additionalFilters.endMarkets,
      20
    )
    
    // Debug logging
    console.log('🔍 Startups Page - displayedStartups calculation:', {
      isLoading,
      startupsLength: startups.length,
      displayedStartupsLength: result.startups.length,
      filteredTotalItems: result.totalItems,
      firstStartup: result.startups[0]
    })
    
    return result
  }, [getFilteredStartupsForPage, page, filterType, locationFilter, additionalFilters, isLoading, startups.length])

  // Sync additionalFilters with URL parameters
  useEffect(() => {
    setAdditionalFilters({
      rounds: rounds ? rounds.split(',').map(r => r.trim()) : [],
      endMarkets: endMarkets ? endMarkets.split(',').map(m => m.trim()) : [],
      companyStatuses: companyStatuses ? companyStatuses.split(',').map(s => s.trim()) : []
    })
  }, [rounds, endMarkets, companyStatuses])

  // Data fetching is handled globally by DataInitializer
  // No need to fetch here - data will be available from global store

  const handlePageChange = (newPage: number) => {
    updateURL({ page: newPage.toString() })
  }

  const handleFiltersChange = (filters: {
    rounds: string[]
    endMarkets: string[]
    companyStatuses: string[]
  }) => {
    setAdditionalFilters(filters)
    // Update URL with filter parameters and reset to page 1
    updateURL({ 
      page: "1",
      rounds: filters.rounds.length > 0 ? filters.rounds.join(',') : null,
      endMarkets: filters.endMarkets.length > 0 ? filters.endMarkets.join(',') : null,
      companyStatuses: filters.companyStatuses.length > 0 ? filters.companyStatuses.join(',') : null
    })
  }

  const handleClearFilter = () => {
    setAdditionalFilters({
      rounds: [],
      endMarkets: [],
      companyStatuses: []
    })
    // Clear all filter parameters from URL and reset to page 1
    updateURL({ 
      page: "1",
      rounds: null,
      endMarkets: null,
      companyStatuses: null,
      location: null
    })
  }

  const handleUpdateURL = (params: any) => {
    // Reset to page 1 when filters change
    updateURL({ ...params, page: "1" })
  }

  // Debug logging for loading state
  console.log('🔍 Startups Page - Loading check:', {
    isLoading,
    startupsLength: startups.length,
    error,
    displayedStartupsLength: displayedStartups.length,
    shouldShowLoading: isLoading || (startups.length === 0 && !error)
  })

  // Show loading state if we're loading OR if we have no data yet (to handle race condition)
  if (isLoading || (startups.length === 0 && !error)) {
    return <div className="text-white text-center py-10">Loading startups...</div>
  }

  if (error) {
    return <div className="text-white text-center py-10">Error loading startups: {error}</div>
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-white mb-6">
        Startups
        <span className="ml-2 text-base font-normal text-white/60">
          {filteredTotalItems > 0 ? `${filteredTotalItems.toLocaleString()} startups` : 'Loading...'} 
          {(locationFilter || additionalFilters.rounds.length > 0 || additionalFilters.endMarkets.length > 0 || additionalFilters.companyStatuses.length > 0) && totalItems > 0 && (
            <span className="text-white/40">
              {` (of ${totalItems.toLocaleString()} total)`}
            </span>
          )}
        </span>
      </h2>

      <FilterForStartups 
        className="mb-4" 
        onFiltersChange={handleFiltersChange}
        locationFilter={locationFilter}
        onClearFilter={handleClearFilter}
        onUpdateURL={handleUpdateURL}
        rounds={rounds}
        endMarkets={endMarkets}
        companyStatuses={companyStatuses}
      />

      <GridView
        type="startup"
        filter={{ type: null, value: null }}
        data={displayedStartups}
        onPageChange={handlePageChange}
        totalItems={filteredTotalItems}
        totalPages={filteredTotalPages}
        currentPage={page}
        isExternalLoading={isLoading}
      />
    </div>
  )
}