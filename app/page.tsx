// This is the home page
// By default, it will show the grid view of the vcs 
"use client"

import { GridView } from "@/components/vc-dashboard/core/GridView"
import { useURLState } from "@/hooks/use-url-state"
import { useRouter } from "next/navigation"

// Import vcs
import type  { VentureData } from "@/lib/data-utils"
import { useState, useEffect, useMemo } from "react"
import { FilterTab } from "@/components/vc-dashboard/filter/FilterTab"
import { useVcStore } from "@/stores"
import { LoadingIndicator } from "@/components/vc-dashboard/shared/LoadingStates"

export default function Home() {
  const { 
    page: urlPage, 
    updateURL, 
    locationFilter, 
    filterType 
  } = useURLState()
  const router = useRouter()
  
  // Use VcStore for all data management (data fetching handled globally in layout)
  // Use explicit selectors to ensure proper reactivity
  const vcs = useVcStore(state => state.vcs)
  const isLoading = useVcStore(state => state.isLoading)
  const error = useVcStore(state => state.error)
  const totalItems = useVcStore(state => state.totalItems)
  const totalPages = useVcStore(state => state.totalPages)
  const getFilteredVcsForPage = useVcStore(state => state.getFilteredVcsForPage)
  
  // Debug logging
  console.log('Home Page Store State:', { 
    isLoading, 
    error, 
    totalItems, 
    vcsLength: vcs.length,
    firstVC: vcs[0]
  })
  
  const [layout, setLayout] = useState<'grid' | 'list'>('grid') // Add layout state
  
  // Data fetching is handled globally in DataInitializer
  // No need for local fetch logic here

  // Get page from URL or default to 1 - ensure it's always a number
  const page = useMemo(() => {
    const parsedPage = urlPage ? parseInt(urlPage, 10) : 1
    console.log('Page calculation - urlPage:', urlPage, 'parsedPage:', parsedPage)
    return isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage
  }, [urlPage])

  // Get filtered VCs with pagination using store method
  // const { vcs: displayedVCs, totalItems: filteredTotalItems, totalPages: filteredTotalPages } = useMemo(() => {
  //   const result = getFilteredVcsForPage(page, filterType, locationFilter, 20)
  //   console.log('🔍 Filtered VCs Result:', { 
  //     displayedVCsCount: result.vcs.length,
  //     filteredTotalItems: result.totalItems,
  //     page,
  //     filterType,
  //     locationFilter,
  //     firstDisplayedVC: result.vcs[0]
  //   })
  //   return result
  // }, [getFilteredVcsForPage, page, filterType, locationFilter])

  const { vcs: displayedVCs, totalItems: filteredTotalItems, totalPages: filteredTotalPages } = useMemo(() => {
    // Only return empty data if we're actually loading, not just if vcs.length === 0
    if (isLoading) {
      return { vcs: [], totalItems: 0, totalPages: 0 }
    }
    return getFilteredVcsForPage(page, filterType, locationFilter, 20)
  }, [getFilteredVcsForPage, page, filterType, locationFilter, isLoading])
  
  
  // Data fetching is now handled globally in layout.tsx via DataInitializer
  // No need to fetch here - data will be available from global stores
  
  const handlePageChange = (newPage: number) => {
    updateURL({ page: newPage.toString() })
  }

  const handleLayoutChange = (newLayout: 'grid' | 'list') => {
    setLayout(newLayout)
  }

  const handleClearFilter = () => {
    updateURL({ page: "1" }) // Clear all filters and reset to page 1
  }

  const handleUpdateURL = (params: any) => {
    // Reset to page 1 when filters change
    updateURL({ ...params, page: "1" })
  }

  // Show loading state if loading OR if no VCs are loaded yet (to handle race condition)
  if (isLoading || (vcs.length === 0 && !error)) {
    // Skeleton grid with 20 cards
    return (
      <div className="text-white">
      <div className="text-sm text-white/60 mt-2">
        This may take a few moments while we fetch VC and Startup data
      </div>  
      <div className="mt-4">
        <LoadingIndicator entityType="vc" showSkeleton={true} />
      </div>
    </div>
  )
  }

  //   return (
  //     <div>
  //       <div className="animate-pulse">
  //         <div className="h-8 bg-white/10 rounded mb-6 w-64"></div>
  //         <div className="h-12 bg-white/10 rounded mb-6 w-full"></div>
  //         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  //           {Array.from({ length: 20 }).map((_, i) => (
  //             <div key={i} className="h-48 bg-white/10 rounded-lg"></div>
  //           ))}
  //         </div>
  //       </div>
  //       <div className="text-white text-center py-4">
  //         <div className="text-lg">Loading VCs...</div>
  //         <div className="text-sm text-white/60 mt-2">
  //           This may take a few moments while we fetch all VC data
  //         </div>
  //       </div>
  //     </div>
  //   )
  // }

  if (error) {
    return (
      <div className="text-white text-center py-10">
        Error loading VCs: {error}
      </div>
    )
  }

  // // If no data is loaded yet and we're not loading, show a minimal loading state
  // if (totalItems === 0 && displayedVCs.length === 0) {
  //   return (
  //     <div>
  //       <h2 className="text-2xl font-bold text-white mb-2">
  //         Venture Capital Firms
  //         <span className="ml-2 text-base font-normal text-white/60">
  //           Loading...
  //         </span>
  //       </h2>
  //       <div className="mb-6">
  //         <FilterTab 
  //           locationFilter={locationFilter}
  //           onClearFilter={handleClearFilter}
  //           onUpdateURL={handleUpdateURL}
  //           onFilterStartupsModalOpen={() => {}}
  //           layout={layout}
  //           onLayoutChange={handleLayoutChange}
  //         />
  //       </div>
  //       <div className="text-white text-center py-10">
  //         <div className="text-lg">Loading VCs...</div>
  //       </div>
  //     </div>
  //   )
  // }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">
        Venture Capital Firms 
        <span className="ml-2 text-base font-normal text-white/60">
          {filteredTotalItems > 0 ? `${filteredTotalItems.toLocaleString()} VCs` : 
           isLoading ? 'Loading...' : 
           totalItems > 0 ? `${totalItems.toLocaleString()} VCs` : 'No VCs found'} 
          {locationFilter && totalItems > 0 && (
            <span className="text-white/40">
              {` (of ${totalItems.toLocaleString()} total)`}
            </span>
          )}
        </span>
      </h2>

      <div className="mb-6">
        <FilterTab 
          locationFilter={locationFilter}
          onClearFilter={handleClearFilter}
          onUpdateURL={handleUpdateURL}
          onFilterStartupsModalOpen={() => {}}
          layout={layout}
          onLayoutChange={handleLayoutChange}
        />
      </div>
      
      {/* {displayedVCs.length > 0 ? 'yuh' : 'no'} */}

      <GridView 
        type="vc" 
        filter={{ type: null, value: null }} 
        data={displayedVCs} 
        onPageChange={handlePageChange}
        totalItems={filteredTotalItems}
        totalPages={filteredTotalPages}
        currentPage={page}
        layout={layout}
        isExternalLoading={isLoading}
      />
    </div>
  )
}
