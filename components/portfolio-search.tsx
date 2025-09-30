"use client"

import { useState, useEffect, useMemo } from "react"
import { Search } from "lucide-react"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { useData } from "@/context/data-context"
import { cn } from "@/lib/utils"

// Update the props interface to include a new prop for filtering by last round
interface PortfolioSearchProps {
  vcId: string
  onStartupSelect: (startup: string) => void
  onHighlightStartup?: (startupId: string | null) => void
  onLastRoundFilterChange?: (lastRound: string | null) => void
  selectedLastRound?: string | null
}

export function PortfolioSearch({
  vcId,
  onStartupSelect,
  onHighlightStartup,
  onLastRoundFilterChange,
  selectedLastRound,
}: PortfolioSearchProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { startups, nonQualifiedStartups } = useData()

  // Get all startups for this VC
  const portfolioStartups = useMemo(() => {
    return startups.filter((startup) => startup.vcId === vcId)
  }, [startups, vcId])

  // Get all non-qualified startups for this VC
  const remainingStartups = useMemo(() => {
    return nonQualifiedStartups.filter((startup) => startup.vcId === vcId)
  }, [nonQualifiedStartups, vcId])

  // Keyboard shortcut to open search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "f" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  // Filter startups based on search query
  const filteredPortfolioStartups = useMemo(() => {
    if (!searchQuery) return portfolioStartups
    return portfolioStartups.filter((startup) => startup.name.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [portfolioStartups, searchQuery])

  const filteredRemainingStartups = useMemo(() => {
    if (!searchQuery) return remainingStartups
    return remainingStartups.filter((startup) => startup.name.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [remainingStartups, searchQuery])

  // Handle selection of a startup
  const handleSelect = (startupName: string, isPortfolio: boolean) => {
    setOpen(false)
    setSearchQuery("")

    if (isPortfolio) {
      // Navigate to startup details for portfolio companies
      onStartupSelect(startupName)
    } else if (onHighlightStartup) {
      // Find the startup in the remaining startups
      const startup = remainingStartups.find((s) => s.name === startupName)
      if (startup) {
        // Highlight the startup
        onHighlightStartup(startup.id)

        // Scroll to the startup card
        const element = document.getElementById(startup.id)
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      }
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="bg-white/10 text-white hover:bg-white/20 border-white/20"
      >
        <Search className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">Search Portfolio</span>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command className="rounded-lg border shadow-md">
          <CommandInput
            placeholder="Search portfolio companies..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>No companies found.</CommandEmpty>

            {filteredPortfolioStartups.length > 0 && (
              <CommandGroup heading="Portfolio Companies">
                {filteredPortfolioStartups.map((startup) => (
                  <CommandItem
                    key={`portfolio-${startup.id}`}
                    value={startup.name}
                    onSelect={() => handleSelect(startup.name, true)}
                  >
                    <div className={cn("mr-2 h-4 w-4 rounded-full bg-blue-500")} />
                    {startup.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {filteredRemainingStartups.length > 0 && (
              <CommandGroup heading="Remaining Portfolio">
                {filteredRemainingStartups.map((startup) => (
                  <CommandItem
                    key={`remaining-${startup.id}`}
                    value={startup.name}
                    onSelect={() => handleSelect(startup.name, false)}
                  >
                    <div className={cn("mr-2 h-4 w-4 rounded-full bg-gray-400")} />
                    {startup.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
