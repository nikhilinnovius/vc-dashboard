"use client"
import { useState, useEffect, useMemo } from "react"
import { useSession } from "next-auth/react"
import { useData } from "@/context/data-context"
import { Button } from "@/components/ui/button"
import { getStartupsForVC } from "@/lib/data-utils"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter, useSearchParams } from "@/navigation"
import { TooltipProvider } from "@/components/ui/tooltip"
import { StartupCard, type StartupData } from "@/components/startup-card"

// Update the StartupListProps interface
interface StartupListProps {
  vc: string | null
  onStartupSelect: (startup: string) => void
  onBack?: () => void
  filter?: {
    type: "city" | "state" | null
    value: string | null
  }
  savedOnly?: boolean
  lastRoundFilter?: string | null
  companyStatusFilter?: string | null
  endMarketFilters?: string[]
  isPortfolio?: boolean
  startups?: any[]
  page?: number
  onPageChange?: (page: number) => void
  onSaveChange?: (startupId: string, saved: boolean) => void
}

// Function to sort startups by company score in descending order
const sortStartupsByScore = (startups: StartupData[]): StartupData[] => {
  return [...startups].sort((a, b) => {
    const scoreA = a.companyScore ? Number.parseFloat(a.companyScore) : 0
    const scoreB = b.companyScore ? Number.parseFloat(b.companyScore) : 0
    return scoreB - scoreA
  })
}

export function StartupList({
  vc,
  onStartupSelect,
  onBack,
  filter,
  savedOnly = false,
  lastRoundFilter = null,
  companyStatusFilter = null,
  endMarketFilters = [],
  isPortfolio = false,
  startups: externalStartups,
  page = 1,
  onPageChange,
  onSaveChange,
}: StartupListProps) {
  const { data: session } = useSession()
  const { startups: allStartups, isLoading } = useData()
  const [savedStartups, setSavedStartups] = useState<string[]>([])
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get current page from URL or use default
  const currentPage = Number.parseInt(searchParams.get("page") || "1", 10)

  // Calculate items per page based on screen size
  const [itemsPerPage, setItemsPerPage] = useState(20)

  // Update items per page based on screen size
  useEffect(() => {
    const updateItemsPerPage = () => {
      const width = window.innerWidth
      if (width >= 2560) {
        setItemsPerPage(36)
      } else if (width >= 1920) {
        setItemsPerPage(30)
      } else if (width >= 1280) {
        setItemsPerPage(24)
      } else if (width >= 1024) {
        setItemsPerPage(18)
      } else if (width >= 768) {
        setItemsPerPage(12)
      } else {
        setItemsPerPage(8)
      }
    }

    updateItemsPerPage()
    window.addEventListener("resize", updateItemsPerPage)
    return () => window.removeEventListener("resize", updateItemsPerPage)
  }, [])

  // Fetch saved startups
  useEffect(() => {
    async function fetchSavedStartups() {
      try {
        const response = await fetch("/api/startups/saved")
        if (response.ok) {
          const data = await response.json()
          setSavedStartups(data.savedStartups || [])
        }
      } catch (error) {
        console.error("Failed to fetch saved startups:", error)
      }
    }

    if (session && session.user) {
      fetchSavedStartups()
    }
  }, [session])

  const handleSaveChange = async (startupName: string, saved: boolean) => {
    try {
      const endpoint = `/api/startups/${saved ? "save" : "unsave"}`
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: startupName }),
      })

      if (response.ok) {
        if (saved) {
          setSavedStartups((prev) => [...prev, startupName])
        } else {
          setSavedStartups((prev) => prev.filter((name) => name !== startupName))
        }
      }
    } catch (error) {
      console.error("Failed to update saved status:", error)
    }
  }

  // Filter startups based on props
  const filteredStartups = useMemo(() => {
    if (isLoading) return []

    console.log("Filtering startups with:", {
      vc,
      savedOnly,
      filterType: filter?.type,
      locationFilter: filter?.value,
      lastRoundFilter,
      companyStatusFilter,
      endMarketFilters,
      totalStartups: (externalStartups || allStartups)?.length,
    })

    let startups = externalStartups || allStartups

    if (vc) {
      const vcId = `vc-${vc.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
      startups = getStartupsForVC(startups, vcId)
    }

    if (savedOnly) {
      startups = startups.filter((startup) => savedStartups.includes(startup.name))
    }

    if (filter?.type && filter?.value) {
      const locations = filter.value.split(",").map((loc) => loc.trim())
      startups = startups.filter((startup) => {
        if (filter.type === "city") {
          return locations.includes(startup.city)
        }
        if (filter.type === "state") {
          return locations.includes(startup.state)
        }
        return true
      })
    }

    if (lastRoundFilter) {
      startups = startups.filter((startup) => startup.lastRound === lastRoundFilter)
    }

    if (companyStatusFilter) {
      startups = startups.filter((startup) => startup.companyStatus === companyStatusFilter)
    }

    if (endMarketFilters && endMarketFilters.length > 0) {
      startups = startups.filter((startup) => {
        if (!startup.endMarket) return false
        const startupMarkets = startup.endMarket.split(",").map((market) => market.trim())
        return endMarketFilters.some((filter) => startupMarkets.includes(filter))
      })
    }

    if (!vc) {
      const uniqueStartups = new Map()
      startups.forEach((startup) => {
        // Use domain as unique identifier, fallback to name if no domain
        const uniqueKey = startup.domain || startup.website || startup.name
        if (!uniqueStartups.has(uniqueKey)) {
          uniqueStartups.set(uniqueKey, startup)
        }
      })
      startups = Array.from(uniqueStartups.values())
    }

    console.log("Filtered startups count:", startups.length)
    return sortStartupsByScore(startups)
  }, [
    allStartups,
    externalStartups,
    vc,
    savedOnly,
    savedStartups,
    filter,
    lastRoundFilter,
    companyStatusFilter,
    endMarketFilters,
    isLoading,
  ])

  // Calculate pagination values
  const totalItems = filteredStartups.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const validPage = Math.max(1, Math.min(currentPage, totalPages || 1))

  // Get current page of startups
  const currentStartups = useMemo(() => {
    const startIndex = (validPage - 1) * itemsPerPage
    return filteredStartups.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredStartups, validPage, itemsPerPage])

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return

    const url = new URL(window.location.href)
    url.searchParams.set("page", newPage.toString())
    router.push(url.toString())

    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading startups...</div>
  }

  if (filteredStartups.length === 0) {
    return (
      <div className="text-center py-8 text-white">
        <p className="mb-4">No startups found matching the current filters.</p>
        {(lastRoundFilter || companyStatusFilter || (endMarketFilters && endMarketFilters.length > 0)) && (
          <Button
            variant="outline"
            onClick={() => {
              window.location.reload()
            }}
            className="bg-white/10 text-white hover:bg-white/20 border-white/20"
          >
            Clear Filters
          </Button>
        )}
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div>
        {onBack && !vc && (
          <div className="mb-6 mt-4">
            <Button
              variant="outline"
              onClick={onBack}
              className="bg-white/10 text-white hover:bg-white/20 border-white/20"
            >
              ← Back to VCs
            </Button>
          </div>
        )}

        {!onBack && (
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              Startups
              <span className="ml-2 text-base font-normal text-white/60">
                {filteredStartups.length} {filteredStartups.length === 1 ? "startup" : "startups"}
              </span>
            </h2>
          </div>
        )}

        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {currentStartups.map((startup, index) => (
            <StartupCard
              key={startup.id}
              startup={startup}
              variant="list"
              onClick={() => {
                // Use domain for navigation to ensure correct startup is loaded
                const startupIdentifier = startup.domain || startup.website || startup.name
                onStartupSelect(startupIdentifier)
              }}
              onSaveChange={(saved) => (onSaveChange || handleSaveChange)(startup.name, saved)}
              isSaved={savedStartups.includes(startup.name)}
              isPortfolio={isPortfolio}
              showAnimation={true}
              animationIndex={index}
            />
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8">
            <div className="text-sm text-white/70">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
              {totalItems} startups
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="bg-white/10 text-white hover:bg-white/20 border-white/20"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <div className="flex items-center space-x-1">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  let pageToShow
                  if (totalPages <= 5) {
                    pageToShow = i + 1
                  } else if (currentPage <= 3) {
                    pageToShow = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageToShow = totalPages - 4 + i
                  } else {
                    pageToShow = currentPage - 2 + i
                  }

                  return (
                    <Button
                      key={pageToShow}
                      variant={pageToShow === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageToShow)}
                      className={
                        pageToShow === currentPage
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-white/10 text-white hover:bg-white/20 border-white/20"
                      }
                    >
                      {pageToShow}
                    </Button>
                  )
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="bg-white/10 text-white hover:bg-white/20 border-white/20"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
