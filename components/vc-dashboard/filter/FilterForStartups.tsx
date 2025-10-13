"use client"

import React, { useState, useMemo, useEffect } from 'react'
import { MultiSelectDropdown } from './MultiSelectDropdown'
import { FilterChips } from './FilterChips'
import { cn } from '@/lib/utils'
import { LayoutToggle } from './LayoutToggle'
import { MultiSelectDropdownForLocation } from '@/components/MultiSelectDropdownForLocation'

// Filter options data
const roundOptions = [
  "Pre-Seed",
  "Seed", 
  "Series A",
  "Series B",
  "Series C",
  "Series D", 
]

export const frontendToBackendRoundMap: Record<string, string> = {
  "Pre-Seed": "PRE_SEED",
  "Seed": "SEED",
  "Series A": "SERIES_A",
  "Series B": "SERIES_B",
  "Series C": "SERIES_C",
  "Series D": "SERIES_D"
}


const endMarketOptions = [
  "Aerospace & Defense",
  "AI",
  "Agriculture",
  "Asset & Wealth Management",
  "Auto",
  "Banking",
  "Beauty & Wellness",
  "Biotech / Pharma / Life Science",
  "Capital Markets",
  "Climate",
  "Commercial Services",
  "Construction Tech",
  "Consumer & Retail & Ecom",
  "Crypto",
  "Customer Service",
  "Cybersecurity",
  "Data Privacy",
  "Data Stack",
  "DevOps",
  "Education",
  "Energy",
  "Enterprise Automation",
  "Entertainment",
  "Field Services",
  "Financial Institutions",
  "Food & Beverage",
  "General Multi Site",
  "Governance, Risk, Compliance (GRC)",
  "GTM",
  "HCM / Benefits",
  "Healthcare",
  "Hospitality / Entertainment / Food",
  "Industrial",
  "Insurance",
  "IT / Telecom",
  "Legal Tech",
  "Manufacturing",
  "Media / Entertainment / Live Events",
  "MLOps",
  "Office of CFO",
  "Payments",
  "Pet Tech",
  "Procurement",
  "Product Development",
  "Professional Services",
  "Property Tech",
  "Public Sector and GovTech",
  "Risk",
  "Supply Chain",
  "Transportation",
  "Utility / Energy / Climate"
];


const companyStatusOptions = [
  "Cold",
  "In Queue",
  "Tracking - Too Early",
  "Contacted",
  "Engaged",
  "Nurture",
  "Meeting Booked",
  "1st Meeting",
  "Follow-up meeting(s)",
  "Data Room",
  "IC 1",
  "IC 1.5",
  "IC 2",
  "IC 3",
  "Term Sheet",
  "Portfolio",
  "Closed",
  "Paused"
];


// No need for filterType complexity - location filtering now checks both city and state fields universally

export interface FilterForStartupsProps {
  onFiltersChange?: (filters: {
    rounds: string[]
    endMarkets: string[]
    companyStatuses: string[]
  }) => void
  layout?: 'grid' | 'list'
  onLayoutChange?: (layout: 'grid' | 'list') => void
  className?: string
  locationFilter?: string | null
  onClearFilter?: () => void
  onUpdateURL?: (params: any) => void
  rounds?: string | null
  endMarkets?: string | null
  companyStatuses?: string | null
}

export const FilterForStartups: React.FC<FilterForStartupsProps> = ({
  onFiltersChange,
  onLayoutChange,
  layout,
  className,
  locationFilter,
  onClearFilter,
  onUpdateURL,
  rounds,
  endMarkets,
  companyStatuses
}) => {
  const [selectedRounds, setSelectedRounds] = useState<string[]>(() => {
    return rounds ? rounds.split(',').map(r => r.trim()) : []
  })
  const [selectedEndMarkets, setSelectedEndMarkets] = useState<string[]>(() => {
    return endMarkets ? endMarkets.split(',').map(m => m.trim()) : []
  })
  const [selectedCompanyStatuses, setSelectedCompanyStatuses] = useState<string[]>(() => {
    return companyStatuses ? companyStatuses.split(',').map(s => s.trim()) : []
  })
  // Initialize location state from URL
  const [selectedLocations, setSelectedLocations] = useState<string[]>(() => {
    if (locationFilter) {
      return locationFilter.split(',').map(loc => loc.trim())
    }
    return []
  })

  // Update selected locations when locationFilter changes
  useEffect(() => {
    if (locationFilter) {
      setSelectedLocations(locationFilter.split(',').map(loc => loc.trim()))
    } else {
      setSelectedLocations([])
    }
  }, [locationFilter])

  // Note: We initialize from URL params in useState, but don't sync with URL changes
  // to avoid conflicts with user interactions. URL updates happen via the handlers.

  // Create filter chips from selected values
  const filterChips = useMemo(() => {
    const chips: Array<{ id: string; label: string; category: string }> = []
    
    selectedRounds.forEach(round => {
      chips.push({ id: `round-${round}`, label: round, category: 'Round' })
    })
    
    selectedEndMarkets.forEach(market => {
      chips.push({ id: `market-${market}`, label: market, category: 'End Market' })
    })
    
    selectedCompanyStatuses.forEach(status => {
      chips.push({ id: `status-${status}`, label: status, category: 'Status' })
    })

    // Add location chips
    selectedLocations.forEach(location => {
      chips.push({ id: `location-${location}`, label: location, category: 'Location' })
    })
    
    return chips
  }, [selectedRounds, selectedEndMarkets, selectedCompanyStatuses, selectedLocations])

  // Handle filter changes and notify parent - removed since we call onFiltersChange directly now

  // Handle individual filter changes
  const handleRoundChange = (rounds: string[]) => {
    setSelectedRounds(rounds)
    
    // Update URL state for round filters
    if (onUpdateURL) {
      onUpdateURL({
        rounds: rounds.length > 0 ? rounds.join(',') : null
      })
    }
    
    // Notify parent immediately with updated filters
    onFiltersChange?.({
      rounds: rounds,
      endMarkets: selectedEndMarkets,
      companyStatuses: selectedCompanyStatuses
    })
  }

  const handleEndMarketChange = (markets: string[]) => {
    setSelectedEndMarkets(markets)
    
    // Update URL state for end market filters
    if (onUpdateURL) {
      onUpdateURL({
        endMarkets: markets.length > 0 ? markets.join(',') : null
      })
    }
    
    // Notify parent immediately with updated filters
    onFiltersChange?.({
      rounds: selectedRounds,
      endMarkets: markets,
      companyStatuses: selectedCompanyStatuses
    })
  }

  const handleCompanyStatusChange = (statuses: string[]) => {
    setSelectedCompanyStatuses(statuses)
    
    // Update URL state for company status filters
    if (onUpdateURL) {
      onUpdateURL({
        companyStatuses: statuses.length > 0 ? statuses.join(',') : null
      })
    }
    
    // Notify parent immediately with updated filters
    onFiltersChange?.({
      rounds: selectedRounds,
      endMarkets: selectedEndMarkets,
      companyStatuses: statuses
    })
  }

  const handleLocationChange = (locations: string[]) => {
    setSelectedLocations(locations)
    
    // Update URL state for location filters (no filterType needed)
    if (onUpdateURL) {
      const locationString = locations.length > 0 ? locations.join(',') : null
      
      onUpdateURL({
        location: locationString
      })
    }
    
    // Notify parent with current filters (location doesn't affect the main filter callback)
    onFiltersChange?.({
      rounds: selectedRounds,
      endMarkets: selectedEndMarkets,
      companyStatuses: selectedCompanyStatuses
    })
  }
  

  // Handle removing individual filter chips
  const handleRemoveFilter = (filterId: string) => {
    if (filterId.startsWith('round-')) {
      const round = filterId.replace('round-', '')
      const newRounds = selectedRounds.filter(r => r !== round)
      setSelectedRounds(newRounds)
      
      // Update URL state for round filters
      if (onUpdateURL) {
        onUpdateURL({
          rounds: newRounds.length > 0 ? newRounds.join(',') : null
        })
      }
    } else if (filterId.startsWith('market-')) {
      const market = filterId.replace('market-', '')
      const newMarkets = selectedEndMarkets.filter(m => m !== market)
      setSelectedEndMarkets(newMarkets)
      
      // Update URL state for end market filters
      if (onUpdateURL) {
        onUpdateURL({
          endMarkets: newMarkets.length > 0 ? newMarkets.join(',') : null
        })
      }
    } else if (filterId.startsWith('status-')) {
      const status = filterId.replace('status-', '')
      const newStatuses = selectedCompanyStatuses.filter(s => s !== status)
      setSelectedCompanyStatuses(newStatuses)
      
      // Update URL state for company status filters
      if (onUpdateURL) {
        onUpdateURL({
          companyStatuses: newStatuses.length > 0 ? newStatuses.join(',') : null
        })
      }
    } else if (filterId.startsWith('location-')) {
      const location = filterId.replace('location-', '')
      const newLocations = selectedLocations.filter(l => l !== location)
      setSelectedLocations(newLocations)
      
      // Update URL state for location filters (no filterType needed)
      if (onUpdateURL) {
        const locationString = newLocations.length > 0 ? newLocations.join(',') : null
        
        onUpdateURL({
          location: locationString
        })
      }
    }
    
    // Notify parent with updated filters
    const newFilters = {
      rounds: filterId.startsWith('round-') ? selectedRounds.filter(r => r !== filterId.replace('round-', '')) : selectedRounds,
      endMarkets: filterId.startsWith('market-') ? selectedEndMarkets.filter(m => m !== filterId.replace('market-', '')) : selectedEndMarkets,
      companyStatuses: filterId.startsWith('status-') ? selectedCompanyStatuses.filter(s => s !== filterId.replace('status-', '')) : selectedCompanyStatuses
    }
    
    onFiltersChange?.(newFilters)
  }

  // Handle clearing all filters
  const handleClearAll = () => {
    setSelectedRounds([])
    setSelectedEndMarkets([])
    setSelectedCompanyStatuses([])
    setSelectedLocations([])
    
    // Clear location filters from URL
    if (onClearFilter) {
      onClearFilter()
    }
    
    // Notify parent with cleared filters
    onFiltersChange?.({
      rounds: [],
      endMarkets: [],
      companyStatuses: []
    })
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:flex md:flex-row gap-2">
          <div className="flex-1 min-w-0 sm:min-w-[200px]">
            <MultiSelectDropdown
              label="Round"
              options={roundOptions}
              selectedValues={selectedRounds}
              onSelectionChange={handleRoundChange}
              placeholder="Round"
              className="text-white"
            />
          </div>
          
          <div className="flex-1 min-w-0 sm:min-w-[200px]">
            <MultiSelectDropdown
              label="End Market"
              options={endMarketOptions}
              selectedValues={selectedEndMarkets}
              onSelectionChange={handleEndMarketChange}
              placeholder="End Market"
              className="text-white"
            />
          </div>
          
          <div className="flex-1 min-w-0 sm:min-w-[200px]">
            <MultiSelectDropdown
              label="Status"
              options={companyStatusOptions}
              selectedValues={selectedCompanyStatuses}
              onSelectionChange={handleCompanyStatusChange}
              placeholder="Status"
              className="text-white"
            />
          </div>

          <div className="flex-1 min-w-0 sm:min-w-[200px]">
            <MultiSelectDropdownForLocation
              label="Filter by Location" 
              selectedValues={selectedLocations}
              onSelectionChange={handleLocationChange}
              dataSource="companies"
            />
          </div>
          
        </div>

        {/* Layout toggle - pushed to the right */}
        {onLayoutChange && (
          <LayoutToggle
            layout={layout || 'grid'}
            onLayoutChange={onLayoutChange}
            className="flex-shrink-0"
          />
        )}
      </div>

      {/* Filter Chips */}
      <FilterChips
        filters={filterChips}
        onRemoveFilter={handleRemoveFilter}
        onClearAll={handleClearAll}
      />
    </div>
  )
}
