import React, { useState, useEffect } from 'react'
import { X, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { LayoutToggle } from "@/components/vc-dashboard/filter/LayoutToggle"
import { usePathname } from 'next/navigation'
import { MultiSelectDropdownForLocation } from '@/components/MultiSelectDropdownForLocation'
import { FilterChips } from './FilterChips'

interface FilterComponentProps {
  locationFilter: string | null
  onClearFilter: () => void
  onUpdateURL: (params: any) => void
  onFilterStartupsModalOpen: () => void
  layout?: 'grid' | 'list'
  onLayoutChange?: (layout: 'grid' | 'list') => void
}

// Helper function to determine entity type from current route
const getEntityTypeFromPath = (pathname: string): "vc" | "startup" | null => {
  if (pathname.includes('/startups') || pathname.includes('/saved/startups')) {
    return "startup"
  }
  if (pathname.includes('/vcs') || pathname === '/' || pathname.includes('/saved/vcs')) {
    return "vc"
  }
  return null
}

const displayTitle = (entityType: "vc" | "startup" | null) => {
  if (entityType === "startup") return "Startups"
  return "Venture Capital Firms"
}

// TODO: Replace with actual counts
const displayCount = (entityType: "vc" | "startup" | null) => {
  if (entityType === "startup") return 1000
  return 2000
}

const displayCountLabel = (entityType: "vc" | "startup" | null) => {
  if (entityType === "startup") return "startups"
  return "firms"
}

// Optimized filter section
export const FilterTab = ({
  locationFilter,
  onClearFilter,
  onUpdateURL,
  onFilterStartupsModalOpen,
  layout = 'grid',
  onLayoutChange,
}: FilterComponentProps) => {
  const pathname = usePathname()
  const entityType = getEntityTypeFromPath(pathname)
  const popularCities = [
    "New York", // Match database format instead of display format
    "Atlanta",
    "Boston",
    "Chicago",
    "London",
    "San Francisco",
  ]

  // Initialize selectedLocations from URL parameters if they exist
  const [selectedLocations, setSelectedLocations] = useState<string[]>(() => {
    if (locationFilter) {
      return locationFilter.split(",").map(loc => loc.trim())
    }
    return []
  })

  // Sync selectedLocations with URL parameters when they change externally
  useEffect(() => {
    if (locationFilter) {
      const urlLocations = locationFilter.split(",").map(loc => loc.trim())
      setSelectedLocations(urlLocations)
    } else {
      setSelectedLocations([])
    }
  }, [locationFilter])

  const handleLocationChange = (locations: string[]) => {
    console.log('🔄 handleLocationChange called with:', locations)
    setSelectedLocations(locations)
    // Update URL parameters to reflect selected locations
    if (locations.length > 0) {
      console.log('📍 Updating URL with locations:', locations.join(","))
      onUpdateURL({
        location: locations.join(","),
        entityType: entityType || "vc",
      })
    } else {
      console.log('🗑️ Clearing filter')
      onClearFilter()
    }
  }

  // Create filter chips from selected locations
  const locationFilterChips = selectedLocations.map((location) => ({
    id: `location-${location}`,
    label: location === "New York" ? "New York City" : location, // Display user-friendly name in chips too
    category: 'Location'
  }))

  // Debug logging
  console.log('🔍 FilterTab Debug:', {
    selectedLocations,
    locationFilter,
    locationFilterChips: locationFilterChips.length
  })

  // Handle removing individual filter chips
  const handleRemoveFilterChip = (chipId: string) => {
    if (chipId.startsWith('location-')) {
      const locationToRemove = chipId.replace('location-', '')
      const updatedLocations = selectedLocations.filter(loc => loc !== locationToRemove)
      setSelectedLocations(updatedLocations)
      
      if (updatedLocations.length > 0) {
        onUpdateURL({
          location: updatedLocations.join(","),
          entityType: entityType || "vc",
        })
      } else {
        onClearFilter()
      }
    }
  }

  // Handle clearing all filter chips
  const handleClearAllChips = () => {
    setSelectedLocations([])
    onClearFilter()
  }

  return (
    <div className="mb-6 mt-2">
      <div className="flex items-center justify-between">
        {/* <div className="flex items-center gap-2 pr-2">
          {locationFilter && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilter}
              className="bg-white/10 text-white hover:bg-white/20 border-white/20"
            >
              Reset Filters
            </Button>
          )}
        </div> */}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
        <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-2 py-2 pb-3">
          {/* {locationFilter && (
            <Badge variant="secondary" className="animate-in fade-in zoom-in">
              Location:
              {locationFilter.includes(",")
                ? (() => {
                    const locations = locationFilter.split(",")
                    return `${locations.length} Cities`
                  })()
                : locationFilter}
              <button
                onClick={(e) => {
                  e.preventDefault()
                  onClearFilter()
                }}
                className="ml-1 rounded-full hover:bg-muted"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Clear filter</span>
              </button>
            </Badge>
          )} */}
          {popularCities.map((city) => {
              const isSelected = selectedLocations.includes(city)
              
              return (
                <Button
                  key={city}
                  variant="outline"
                  size="sm"
                  className={`whitespace-nowrap ${
                    isSelected
                      ? "bg-white text-black border-white hover:bg-gray-100 hover:text-black"
                      : "bg-white/10 text-white hover:bg-white/20 border-white/20"
                  }`}
                  onClick={() => {
                    if (isSelected) {
                      handleLocationChange(selectedLocations.filter(loc => loc !== city))
                    } else {
                      handleLocationChange([...selectedLocations, city])
                    }
                  }}
                >
                  {city === "New York" ? "New York City" : city}
                </Button>
              )
            })}
          {entityType === "startup" && (
            <Button
              variant="outline"
              onClick={onFilterStartupsModalOpen}
              className="bg-white/10 text-white hover:bg-white/20 border-white/20 h-10 px-3 py-2 text-sm"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filter Startups
            </Button>
        )}

        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <MultiSelectDropdownForLocation
            label="Filter by Location"
            selectedValues={selectedLocations}
            onSelectionChange={handleLocationChange}
            dataSource="vcs"
            className="flex-shrink-0 mb-1"
          />
        </div>
      
      
          {/* Layout toggle */}
      {onLayoutChange && (
        <LayoutToggle
          layout={layout}
          onLayoutChange={onLayoutChange}
          className="ml-1"
        />
      )}
      </div>
      {/* Filter Chips */}
      {locationFilterChips.length > 0 && (
          <div className="mt-3">
            <FilterChips
              filters={locationFilterChips}
              onRemoveFilter={handleRemoveFilterChip}
              onClearAll={handleClearAllChips}
              className="mb-2"
            />
          </div>
        )}
    </div>
  )
}