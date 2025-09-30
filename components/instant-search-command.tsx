"use client"

import * as React from "react"
import { Search } from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useGlobalSearch } from "@/stores/useSearchPool"
import type { SearchItem } from "@/stores/useSearchPool"

interface SearchableItem {
  id: string
  name: string
  city: string | null
  state: string | null
  entityType: "vc" | "company"
  website?: string | null
}

interface SearchCommandProps {
  onVCSelect: (vc: string) => void
  onStartupSelect: (startup: string) => void
}

// Debounce hook for search queries
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value)

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export function InstantSearchCommand({ onVCSelect, onStartupSelect }: SearchCommandProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [searchResults, setSearchResults] = React.useState<SearchableItem[]>([])
  
  // Use global search hook instead of API calls
  const { search, isInitialized } = useGlobalSearch()
  
  // Debounce search query to avoid too many searches
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  // Search using global search pool
  React.useEffect(() => {
    if (!isInitialized) {
      setSearchResults([])
      return
    }

    if (!debouncedSearchQuery.trim()) {
      setSearchResults([])
      return
    }

    // Use global search with limit
    const results = search(debouncedSearchQuery)
      .slice(0, 20) // Limit to 20 results
      .map((item: SearchItem): SearchableItem => ({
        id: item.id,
        name: item.name,
        city: item.city,
        state: item.state,
        entityType: item.entityType,
        website: item.website
      }))

    setSearchResults(results)
  }, [debouncedSearchQuery, search, isInitialized])

  const handleSelect = React.useCallback(
    (item: SearchableItem) => {
      if (item.entityType === "vc") {
        onVCSelect(item.id)
      } else {
        // For startups/companies, use the name as identifier
        onStartupSelect(item.id)
      }
      setOpen(false)
      setSearchQuery("")
    },
    [onVCSelect, onStartupSelect],
  )

  // Show empty state when no query or not initialized
  const showEmptyState = !searchQuery.trim() || !isInitialized
  const showNoResults = searchQuery.trim() && isInitialized && searchResults.length === 0

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full max-w-[180px] justify-start text-sm text-muted-foreground sm:w-64 sm:pr-12 truncate"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span>Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Search VCs and Startups..." 
          value={searchQuery} 
          onValueChange={setSearchQuery} 
        />
        <CommandList>
          {showEmptyState && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {!isInitialized ? "Loading search data..." : "Start typing to search for VCs and Startups..."}
            </div>
          )}
          
          {showNoResults && (
            <CommandEmpty>No results found for "{searchQuery}"</CommandEmpty>
          )}
          
          {searchResults.length > 0 && (
            <CommandGroup heading={`Search Results (${searchResults.length})`}>
              {searchResults.map((item) => (
                <CommandItem
                  key={`${item.entityType}-${item.name}-${item.id}`}
                  value={`${item.entityType}-${item.name}-${item.city}`}
                  onSelect={() => handleSelect(item)}
                  className="flex justify-between cursor-pointer hover:bg-accent"
                >
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={item.entityType === "vc" ? "default" : "secondary"}
                      className={`text-xs px-2 py-0 h-5 ${
                        item.entityType === "vc"
                          ? "bg-blue-500 hover:bg-blue-500"
                          : "bg-emerald-500 hover:bg-emerald-500 text-white"
                      }`}
                    >
                      {item.entityType === "vc" ? "VC" : "Startup"}
                    </Badge>
                    <div className="flex flex-col">
                      <span className="font-medium">{item.name}</span>
                      {item.entityType === "company" && item.website && (
                        <span className="text-xs text-muted-foreground">
                          {item.website}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground ml-2">
                    {item.city || "Unknown"}, {item.state || "Unknown"}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
