"use client"

import { useEffect, useState } from "react"
import { CompanyLogo } from "@/components/vc-dashboard/core/OrgIcon"
import type { StartupData, VentureData } from "@/lib/data-utils"
import { transformToStartupData, transformToVentureData } from "@/lib/data-transforms"
import { GridView } from "@/components/vc-dashboard/core/GridView"
import { FilterForStartups } from "@/components/vc-dashboard/filter/FilterForStartups"
// import { useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { ArrowLeft } from "lucide-react"
import { useURLState } from "@/hooks/use-url-state"


// Helper function to convert AUM to billions or millions
function normalizeAUM(aum: string | undefined): string {
  if (!aum) return ""
  const numValue = typeof aum === "string" ? Number.parseFloat(aum) : aum

  // If value is in hundred thousands, format as hundreds of thousands
  if (numValue >= 100000 && numValue < 1000000) {
    const aumInHundredThousands = Math.round(numValue / 100000)
    return `${aumInHundredThousands}k`
  }

  // Otherwise, format as millions
  const aumInMillions = Math.round(numValue / 1000000)
  return `${aumInMillions}M`
}

export default function VCDetailPage({ params }: { params: { id: string } }) {
  // const router = useRouter()
  const vcId = params.id
  const [vc, setVc] = useState<VentureData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [layout, setLayout] = useState<'grid' | 'list'>('grid')
  const [portfolioCompanies, setPortfolioCompanies] = useState<StartupData[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [numberOfPortfolioCompanies, setNumberOfPortfolioCompanies] = useState(0)
  const [previousPageUrl, setPreviousPageUrl] = useState<string | null>(null)

  const { 
    page: urlPage, 
    updateURL, 
    locationFilter, 
    filterType,
    rounds,
    endMarkets,
    companyStatuses
  } = useURLState()

  const [filters, setFilters] = useState<{
    rounds: string[]
    endMarkets: string[]
    companyStatuses: string[]
  }>({
    rounds: [],
    endMarkets: [],
    companyStatuses: []
  })

  // Capture previous page URL on mount
  useEffect(() => {
    // Try to get referrer first
    if (document.referrer && document.referrer.includes(window.location.origin)) {
      const referrerUrl = new URL(document.referrer)
      const referrerPath = referrerUrl.pathname
      
      if (referrerPath === "/" || referrerPath === "/vcs") {
        setPreviousPageUrl(document.referrer)
        console.log('Captured previous page URL from referrer:', document.referrer)
        return
      }
    }
  }, [])

  useEffect(() => {
    const fetchVC = async () => {
      try {
        const response = await fetch(`/api/vc/${vcId}`)
        if (!response.ok) {
          throw new Error(`Failed to fetch VC: ${response.status}`)
        }
        let data: { data: VentureData } = await response.json()
        if (data) {
          const vc = data.data
          setVc(transformToVentureData(vc))
          console.log('Fetched VC:', vc)
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load VC')
      } finally {
        setIsLoading(false)
      }
    };
    fetchVC()
  }, [vcId])

  // Fetch portfolio companies for this VC
  useEffect(() => {
    const fetchPortfolioCompanies = async () => {
      if (!vcId) return
      
      try {
        // Build query parameters for filters
        const queryParams = new URLSearchParams({
          page: currentPage.toString()
        })
        
        if (filters.rounds.length > 0) {
          queryParams.set('rounds', filters.rounds.join(','))
        }
        if (filters.endMarkets.length > 0) {
          queryParams.set('endMarkets', filters.endMarkets.join(','))
        }
        if (filters.companyStatuses.length > 0) {
          queryParams.set('companyStatuses', filters.companyStatuses.join(','))
        }

        const response = await fetch(`/api/fetch-startups/${vcId}?${queryParams.toString()}`)
        if (!response.ok) {
          throw new Error(`Failed to fetch portfolio companies: ${response.status}`)
        }
        
        const data = await response.json()
        if (data.error) {
          throw new Error(data.error)
        }
        const transformedStartups = data.startups?.map(transformToStartupData) || []
        setPortfolioCompanies(transformedStartups)
        setNumberOfPortfolioCompanies(data.numberOfStartups || 0)
        
        // Use server-side pagination data
        setTotalItems(data.totalItems || 0)
        setTotalPages(data.totalPages || 0)
      } catch (error) {
        console.error('Error fetching portfolio companies:', error)
      }
    }

    fetchPortfolioCompanies()
  }, [vcId, currentPage, filters])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  const handleClearFilter = () => {
    setFilters({ rounds: [], endMarkets: [], companyStatuses: [] })
    setCurrentPage(1)
    updateURL({
      page: "1",
      rounds: null,
      endMarkets: null,
      companyStatuses: null,
      location: null
    })
  }

  const handleUpdateURL = (params: any) => {
    // Reset to page 1 when filters change via child component
    updateURL({ ...params, page: "1" })
  }

  
  const handleFiltersChange = (filters: {
    rounds: string[]
    endMarkets: string[]
    companyStatuses: string[]
  }) => {
    setFilters(filters)
    // Update URL with filter parameters and reset to page 1
    updateURL({ 
      page: urlPage ? urlPage.toString() : "1",
      rounds: filters.rounds.length > 0 ? filters.rounds.join(',') : null,
      endMarkets: filters.endMarkets.length > 0 ? filters.endMarkets.join(',') : null,
      companyStatuses: filters.companyStatuses.length > 0 ? filters.companyStatuses.join(',') : null
    })
  }

  const handlePageChange = (newPage: number) => {
    updateURL({ page: newPage.toString() })
    setCurrentPage(newPage)
  }

  // const handleBack = () => {
  //   console.log('=== VC BACK BUTTON DEBUG ===')
  //   console.log('Previous page URL:', previousPageUrl)
  //   console.log('Document referrer:', document.referrer)
    
  //   // Always go to VCs page with search parameters from the previous page
  //   if (previousPageUrl) {
  //     try {
  //       const referrerUrl = new URL(previousPageUrl)
  //       const searchParams = referrerUrl.search
  //       const vcsUrl = `/vcs${searchParams}`
  //       console.log('Navigating to VCs page with search params:', vcsUrl)
  //       router.push(vcsUrl)
  //       return
  //     } catch (e) {
  //       console.error('Error parsing previous page URL:', e)
  //     }
  //   }
    
  //   // Fallback: go to VCs page without search params
  //   console.log('No previous page available, going to VCs page')
  //   router.push("/vcs")
  // }

  return (
    <div className="p-2">
      {/* Back Button
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" onClick={handleBack} className="text-white hover:text-white/80 hover:bg-white/10">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div> */}
      
      <div className="flex flex-row items-center gap-3 text-sm font-normal text-white/60 mb-4">
          <div className="flex-shrink-0">
            <CompanyLogo
              domain={vc?.website || ""}
              name={vc?.name || ""}
              size={50}
              type="vc"
              className="flex-shrink-0"
              onLoad={() => {}}
            />
          </div>
          <div>
          <h2 className="text-2xl font-bold text-white mb-1">
            {vc?.name}
            <span className="ml-2 text-base font-normal text-white/60">
            </span>
          </h2>
          {vc?.vcScore && (
          <div className="flex items-center gap-3 text-sm font-normal text-white/60 mb-1">
            <span>Score: {vc?.vcScore}</span><span>|</span>
            <span>Portfolio Size: {numberOfPortfolioCompanies}</span>{vc?.aum && <span>|</span>}
            {vc?.aum && (<span>AUM: {normalizeAUM(vc.aum)}</span>)}
          </div>
          )}
          </div>
      </div>
      

      {/* Filter Ribbon */}
      <FilterForStartups 
        onFiltersChange={handleFiltersChange} 
        layout={layout} 
        onLayoutChange={setLayout} 
        className="mb-4" 
        onClearFilter={handleClearFilter}
        onUpdateURL={handleUpdateURL}
        rounds={rounds}
        endMarkets={endMarkets}
        companyStatuses={companyStatuses}
      />
      
      <GridView 
        type="startup" 
        filter={{ type: null, value: null }} 
        data={portfolioCompanies} 
        onPageChange={handlePageChange}
        totalItems={totalItems}
        totalPages={totalPages}
        currentPage={currentPage}
        layout={layout}
        isExternalLoading={isLoading}
      />
    </div>
  )
}