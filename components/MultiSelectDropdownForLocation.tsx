"use client"

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { ChevronDown, ChevronUp, Search, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

// interface Location {
//   city: string
//   state: string
//   display: string
// }

interface MultiSelectDropdownForLocationProps {
  label: string
  selectedValues: string[]
  onSelectionChange: (values: string[]) => void
  className?: string
  // Determines which API endpoint to use: 'vcs' or 'companies'
  dataSource: 'vcs' | 'companies'
}

export const MultiSelectDropdownForLocation: React.FC<MultiSelectDropdownForLocationProps> = ({
  label,
  selectedValues,
  onSelectionChange,
  // placeholder = "Select locations...",
  className,
  dataSource
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [locations, setLocations] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch locations from the appropriate API endpoint
  useEffect(() => {
    const fetchLocations = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const endpoint = dataSource === 'vcs' ? '/api/locations/vcs' : '/api/locations/companies'
        const response = await fetch(endpoint)

        if (!response.ok) {
          throw new Error(`Failed to fetch locations: ${response.status}`)
        }
        
        const data = await response.json()
        setLocations(data.locations || [])
        console.log("Locations fetched:", data.locations)
      } catch (err) {
        console.error('Error fetching locations:', err)
        setError(err instanceof Error ? err.message : 'Failed to load locations')
        setLocations([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchLocations()
  }, [dataSource])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchQuery("")
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Filter locations based on search query
  const filteredLocations = useMemo(() => {
    if (!searchQuery.trim()) {
      return locations
    }
    
    const query = searchQuery.toLowerCase().trim()
    return locations.filter(location =>
      location.toLowerCase().includes(query)
    )
  }, [locations, searchQuery])

  const handleToggle = (value: string) => {
    if (selectedValues.includes(value)) {
      onSelectionChange(selectedValues.filter(v => v !== value))
    } else {
      onSelectionChange([...selectedValues, value])
    }
  }

  const handleClearAll = () => {
    if (filteredLocations.length === 0) return
    
    const filteredValues = filteredLocations
    const newSelectedValues = selectedValues.filter(value => !filteredValues.includes(value))
    onSelectionChange(newSelectedValues)
  }

  const displayText = "All Locations"

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      <Button
        variant="outline"
        size={dataSource === "vcs" ? "sm" : "default"}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full sm:w-48 justify-between text-left font-normal bg-background/30 border-border/60 hover:bg-background/50 hover:border-border transition-colors",
        )}
        disabled={isLoading}
      >
        <div className="flex items-center space-x-2 min-w-0">
          <MapPin className="h-4 w-4 text-white flex-shrink-0" />
          <span className="truncate text-white">
            {isLoading ? "Loading..." : displayText}
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-white flex-shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-white flex-shrink-0" />
        )}
      </Button>
      
      {isOpen && (
        <div className="absolute top-full left-0 w-full sm:w-80 z-50 mt-1 bg-background/95 backdrop-blur-sm border border-border/60 rounded-lg shadow-xl max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-border/60">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50 border-border/40 text-black placeholder:text-black/60"
              />
            </div>
          </div>

          {/* Action Buttons */}
          {filteredLocations.length > 0 && (
            <div className="p-2 border-b border-border/60 flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="text-xs text-gray-400 hover:text-gray-300 hover:bg-gray-400/10"
              >
                Clear All
              </Button>
            </div>
          )}

          {/* Content Area */}
          <div className="max-h-60 overflow-y-auto">
            {error ? (
              <div className="p-4 text-center text-red-400 text-sm">
                {error}
              </div>
            ) : isLoading ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                Loading locations...
              </div>
            ) : filteredLocations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                {searchQuery.trim() ? "No locations found" : "No locations available"}
              </div>
            ) : (
              <div className="p-2">
                {filteredLocations.map((location) => (
                  <div
                    key={location}
                    className="flex items-center space-x-3 p-2 hover:bg-accent/50 rounded-md cursor-pointer transition-colors"
                    onClick={() => handleToggle(location)}
                  >
                    <Checkbox
                      checked={selectedValues.includes(location)}
                      className="flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-black block truncate">
                        {location}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
