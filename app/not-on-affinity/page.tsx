"use client"

import { useState, useEffect, useMemo } from "react"
import { useURLState } from "@/hooks/use-url-state"
import { GridView } from "@/components/vc-dashboard/core/GridView"
import type { StartupData } from "@/lib/data-utils"
import { transformNonQualifiedStartupData, transformToStartupData } from "@/lib/data-transforms"
import { StartupGridSkeleton } from "@/components/skeleton-components"
import { LoadingIndicator } from "@/components/vc-dashboard/shared/LoadingStates"

export default function NonAffinityStartupsPage() {
  const { page: urlPage, updateURL } = useURLState()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalItems, setTotalItems] = useState(0) // number of non qualified startups
  const [totalPages, setTotalPages] = useState(0)
  const [loadedBatch, setLoadedBatch] = useState(0)
  const [allLoadedStartups, setAllLoadedStartups] = useState<StartupData[]>([])


  // return NextResponse.json({ 
  //   startups: data, 
  //   totalStartupCount: startupCount, 
  //   pages: totalPages, 
  //   currentPage: page,
  //   cardsCount: data?.length || 0, 
  //   cardsPerPage: cardsPerPage, 
  //   apiLimit: limit, // API batch size,
  //   timeTaken: new Date().getTime() - new Date().getTime(),
  // })

  const page = useMemo(() => {
    const parsedPage = urlPage ? parseInt(urlPage, 10) : 1
    return isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage
  }, [urlPage])

  const currentBatch = useMemo(() => {
    return Math.ceil(page / 10)
  }, [page])

  const displayedStartups = useMemo(() => {
    if (allLoadedStartups.length === 0) return []
    const startIndex = ((page - 1) % 10) * 20
    const endIndex = startIndex + 20
    return allLoadedStartups.slice(startIndex, endIndex)
  }, [allLoadedStartups, page])

  useEffect(() => {
    if (!page || page < 1) return
    if (currentBatch === loadedBatch && allLoadedStartups.length > 0 && loadedBatch > 0) return

    async function fetchStartups() {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch(`/api/fetch-nonqualified?page=${currentBatch}`)
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Failed to fetch startups: ${response.statusText}`)
        }
        const data = await response.json()

        console.log('Data:', data)

        // Show helpful message if using estimated count
        if (data.isEstimatedCount) {
          console.log('Using estimated count for better performance')
        }

        const startups = (data?.startups || []).map(transformNonQualifiedStartupData)
        console.log('Startups:', startups)

        setAllLoadedStartups(startups)
        setTotalItems(data?.totalStartupCount || 0)
        setTotalPages(data?.pages || 0)
        setLoadedBatch(currentBatch)
        
      } catch (err) {
        console.error('Error fetching startups:', err)
        const errorMessage = err instanceof Error ? err.message : "Failed to load startups"
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    const timeoutId = setTimeout(() => {
      fetchStartups()
    }, 100)
    return () => clearTimeout(timeoutId)
  }, [currentBatch, loadedBatch, allLoadedStartups.length, page])

  useEffect(() => {
    if (loadedBatch === 0 && page >= 1) {
      setLoadedBatch(-1)
    }
  }, [page, loadedBatch])

  const handlePageChange = (newPage: number) => {
    updateURL({ page: newPage.toString() })
  }

  if (isLoading) {
    return StartupGridSkeleton({ count: Math.ceil(totalItems/totalPages) })
    // return <div className="text-white text-center py-10">Loading startups...</div>
  }

  if (error) {
    return (
      <div className="text-white text-center py-10">
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">Error loading startups</h3>
          <p className="text-white/80">{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  if (isLoading) {
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

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-white mb-6">
        Prospect Companies (Not on Affinity)
        <span className="ml-2 text-base font-normal text-white/60">
          {totalItems > 0 ? `${totalItems.toLocaleString()} Startups` : "Loading..."}
        </span>
      </h2>

      <GridView
        type="startup"
        filter={{ type: null, value: null }}
        data={displayedStartups}
        onPageChange={handlePageChange}
        totalItems={totalItems}
        totalPages={totalPages}
        currentPage={page}
        isInAffinity={false}
        isExternalLoading={isLoading}
      />
    </div>
  )
}