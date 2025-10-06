"use client"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useCallback, useEffect, useMemo } from "react"

import { Button } from "@/components/ui/button"
import { TooltipProvider } from "@/components/ui/tooltip"
import type { VentureData } from "@/lib/data-utils"
import { VCCard } from "@/components/VCCard"
import { NotesModal } from "../modals/NotesModal"
import { StartupCard } from "@/components/vc-dashboard/core/StartupCard"
import { type StartupData } from "@/lib/data-utils"
import { LoadingIndicator } from "@/components/vc-dashboard/shared/LoadingStates"
import { LogoPreloader } from "@/components/LogoPreloader"

interface GridViewProps {
  type: "vc" | "startup"
  filter: {
    type: "city" | "state" | null
    value: string | null
  }
  onTotalItemsChange?: (count: number) => void
  onPageChange?: (page: number) => void

  // Additional props for startups
  lastRoundFilter?: string | null
  statusFilter?: string | null
  endMarketFilters?: string[]
  isPortfolio?: boolean
  data: any[]
  layout?: 'grid' | 'list'

  // Pagination props
  totalItems?: number
  totalPages?: number
  currentPage?: number
  
  // Loading state from parent
  isExternalLoading?: boolean
}

export function GridView({
  onTotalItemsChange,
  onPageChange,
  lastRoundFilter,
  statusFilter,
  endMarketFilters = [],
  data,
  totalItems: propTotalItems,
  totalPages: propTotalPages,
  currentPage: propCurrentPage, 
  type,
  layout="grid",
  isExternalLoading = false,
}: GridViewProps) {
  const [selectedItemForNote, setSelectedItemForNote] = useState<string | null>(null)
  const [websiteForNoteDialog, setWebsiteForNoteDialog] = useState<string>("")
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // State for pagination and UI
  const [currentPage, setCurrentPage] = useState(propCurrentPage || 1)
  const itemsPerPage = 50

  // Use props for pagination when available, otherwise calculate from external data
  const totalItems = propTotalItems !== undefined ? propTotalItems : (data ? data.length : 0)
  const totalPages = propTotalPages !== undefined ? propTotalPages : Math.ceil(totalItems / itemsPerPage)
  
  // When using server-side pagination (props provided), use external data directly
  // Otherwise, do client-side pagination
  const paginatedItems = propTotalItems !== undefined 
    ? data 
    : data ? data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) : []

  // Update total items count when external data changes
  useEffect(() => {
    if (onTotalItemsChange) {
      onTotalItemsChange(totalItems)
    }
  }, [totalItems, onTotalItemsChange])

  // Sync current page with props
  useEffect(() => {
    if (propCurrentPage && propCurrentPage !== currentPage) {
      setCurrentPage(propCurrentPage)
    }
  }, [propCurrentPage, currentPage])


  const handleNoteClick = useCallback((itemName: string, website: string) => {
    setSelectedItemForNote(itemName)
    setWebsiteForNoteDialog(website)
    setIsNoteDialogOpen(true)
  }, [])

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page)
      if (onPageChange) {
        onPageChange(page)
      }
      window.scrollTo({ top: 0, behavior: "smooth" })
    },
    [onPageChange], 
  )

  const handleVCSelect = useCallback((vcId: string) => {
    // Navigate to VC details page
    window.location.href = `/vcs/${vcId}`
  }, [])

  // Filter items based on additional filters (for startups)
const filteredItems = useMemo(() => {
    let filtered = paginatedItems

    if (type === "startup" && data) {
      // Apply additional filters for startups
      if (lastRoundFilter) {
        filtered = filtered.filter((item: any) => item.lastRound === lastRoundFilter)
      }
      if (statusFilter) {
        filtered = filtered.filter((item: any) => item.status === statusFilter)
      }
      if (endMarketFilters && endMarketFilters.length > 0) {
        filtered = filtered.filter((item: any) => {
          if (!item.endMarket) return false
          const itemMarkets = item.endMarket.split(",").map((market: string) => market.trim())
          return endMarketFilters.some((filter: string) => itemMarkets.includes(filter))
        })
      }
    }

    return filtered
  }, [paginatedItems, type, lastRoundFilter, statusFilter, endMarketFilters])

  // Debug logging
  console.log('GridView data:', data)
  console.log('GridView data type:', typeof data)
  console.log('GridView data isArray:', Array.isArray(data))
  console.log('GridView data length:', data?.length)
  console.log('GridView isExternalLoading:', isExternalLoading)
  console.log('GridView local isLoading:', isLoading)

  // Use external loading state if provided, otherwise use local loading state
  const effectiveLoading = isExternalLoading || isLoading

  // Show loading if we're loading or if data is not yet available
  if (effectiveLoading || !data || !Array.isArray(data)) {
    return (
      <LoadingIndicator entityType={type} showSkeleton={true} />  
    )
  }

  // Only show "no items found" if we have confirmed empty data
  if (data.length === 0) {
    return (
      <TooltipProvider>
        <div className="text-white text-center py-10">No {type}s found matching your criteria.</div>
      </TooltipProvider>
    )
  }

  // const totalFilteredItems = filteredItems.length

  return (
    <TooltipProvider>
      <div>
        {/* Logo Preloader for next page */}
        {type === "startup" && (
          <LogoPreloader
            startups={data}
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
          />
        )}
        
        <div className={layout === 'grid' ? "grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid gap-4 sm:gap-6 grid-cols-1"}>
          {filteredItems.map((item, index) => (
            type === "vc" ? (
              <VCCard
                key={item.id || `vc-${index}`}
                vcData={item as VentureData}
                layout={layout}
                index={index}
                animate={true}
                isSaved={false}
                onNoteClick={handleNoteClick}
              />
            ) : (
              <StartupCard
                key={item.id || `startup-${index}`}
                startupData={item as StartupData}
                layout={layout}
                index={index}
                animate={true}
                isSaved={false}
                onNoteClick={handleNoteClick}
              />
            )
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-white/70">
              {propTotalItems !== undefined ? (
                // Server-side pagination
                `Showing ${(currentPage - 1) * itemsPerPage + 1} to ${Math.min(currentPage * itemsPerPage, totalItems)} of ${totalItems.toLocaleString()} ${type === "vc" ? "venture capital firms" : "companies"}`
              ) : (
                // Client-side pagination
                `Showing ${(currentPage - 1) * itemsPerPage + 1} to ${Math.min(currentPage * itemsPerPage, totalItems)} of ${totalItems.toLocaleString()} ${type === "vc" ? "venture capital firms" : "companies"}`
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="bg-white/10 text-gray-500 hover:bg-white/20 border-white/20"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageToShow = i + 1
                  if (totalPages <= 5) {
                    pageToShow = i + 1
                  } else if (currentPage <= 3) {
                    pageToShow = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageToShow = totalPages - 4 + i
                  } else {
                    pageToShow = currentPage - 2 + i
                  }

                  if (pageToShow < 1 || pageToShow > totalPages) {
                    return null
                  }

                  return (
                    <Button
                      key={pageToShow}
                      variant={pageToShow === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageToShow)}
                      className={
                        pageToShow === currentPage
                          ? "bg-green-600 text-white hover:bg-green-700"
                          : "bg-white/10 text-gray-500 hover:bg-white/20 border-white/20"
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
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="bg-white/10 text-gray-500 hover:bg-white/20 border-white/20"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
        <NotesModal
          isOpen={isNoteDialogOpen}
          onOpenChange={setIsNoteDialogOpen}
          selectedVC={selectedItemForNote || ""}
          website={websiteForNoteDialog}
        />
      </div>
    </TooltipProvider>
  )
}
