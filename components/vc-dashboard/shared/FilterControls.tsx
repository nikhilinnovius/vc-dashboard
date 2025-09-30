import React from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Filter, X } from "lucide-react"
import { formatLocationCount } from "@/utils/string-utils"

interface FilterControlsProps {
  filterType: "state" | "city" | null
  locationFilter: string | null
  onClearFilter: () => void
  onUpdateURL: (params: any) => void
  localEntityType: "vc" | "startup" | null
  onFilterStartupsModalOpen: () => void
  fullyFilteredStartupsCount: number
  filteredStartupsLength: number
  filteredVCsCount: number
  viewingSaved: string | null
  popularCities?: string[]
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  filterType,
  locationFilter,
  onClearFilter,
  onUpdateURL,
  localEntityType,
  onFilterStartupsModalOpen,
  fullyFilteredStartupsCount,
  filteredStartupsLength,
  filteredVCsCount,
  viewingSaved,
  popularCities = [
    "New York City",
    "Atlanta", 
    "Boston",
    "Seattle",
    "Austin",
    "Chicago",
    "London",
    "San Francisco",
  ]
}) => {
  const getTitle = () => {
    if (localEntityType === "startup") return "Startups"
    if (localEntityType === "vc") return "Venture Capital Firms"
    if (viewingSaved === "vcs") return "Saved Venture Capital Firms"
    if (viewingSaved === "startups") return "Saved Startups"
    return "Venture Capital Firms"
  }

  const getCount = () => {
    if (localEntityType === "startup") return fullyFilteredStartupsCount || filteredStartupsLength
    return filteredVCsCount
  }

  const getCountLabel = () => {
    if (localEntityType === "startup") return "startups"
    if (localEntityType === "vc") return "firms"
    if (viewingSaved === "vcs") return "firms"
    if (viewingSaved === "startups") return "startups"
    return "firms"
  }

  return (
    <div className="mb-8 mt-12">
      {/* Location Filter Badge */}
      {locationFilter && filterType && (
        <div className="mb-4">
          <Badge variant="secondary" className="animate-in fade-in zoom-in">
            {filterType}:
            {locationFilter.includes(",")
              ? formatLocationCount(locationFilter.split(","), filterType)
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
        </div>
      )}

      {/* Popular Cities */}
      {!locationFilter && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {popularCities.map((city) => (
              <Button
                key={city}
                variant="outline"
                size="sm"
                className="bg-white/10 text-white hover:bg-white/20 border-white/20 whitespace-nowrap"
                onClick={() => {
                  onUpdateURL({
                    filterType: "city",
                    location: city === "New York City" ? "New York" : city,
                    entityType: localEntityType || "vc",
                  })
                }}
              >
                {city}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Title and Count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-white">
            {getTitle()}
            <span className="ml-2 text-base font-normal text-white/60">
              {getCount()} {getCountLabel()}
            </span>
          </h2>
          
          {localEntityType === "startup" && (
            <Button
              variant="outline"
              onClick={onFilterStartupsModalOpen}
              className="bg-white/10 text-white hover:bg-white/20 border-white/20 h-10 px-3 py-2 text-sm ml-4"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filter Startups
            </Button>
          )}
        </div>
        
        {(filterType || locationFilter) && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilter}
            className="bg-white/10 text-white hover:bg-white/20 border-white/20"
          >
            Reset Filters
          </Button>
        )}
      </div>
    </div>
  )
}
