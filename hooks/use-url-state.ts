import { useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from "@/navigation"

interface URLParams {
  vc?: string | null
  startup?: string | null
  entityType?: string | null
  filterType?: string | null
  location?: string | null
  saved?: string | null
  page?: string | null
  rounds?: string | null
  endMarkets?: string | null
  companyStatuses?: string | null
}

interface UseURLStateReturn {
  selectedVC: string | null
  selectedStartup: string | null
  filterType: "state" | "city" | null
  locationFilter: string | null
  viewingSaved: "vcs" | "startups" | null
  entityType: "vc" | "startup" | null
  page: string | null
  rounds: string | null
  endMarkets: string | null
  companyStatuses: string | null
  updateURL: (params: URLParams) => void
  router: any
}

export const useURLState = (): UseURLStateReturn => {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Memoize the search params to prevent unnecessary re-renders
  const params = useMemo(() => ({
    selectedVC: searchParams.get("vc"),
    selectedStartup: searchParams.get("startup"),
    filterType: searchParams.get("filterType") as "state" | "city" | null,
    locationFilter: searchParams.get("location"),
    viewingSaved: searchParams.get("saved") as "vcs" | "startups" | null,
    entityType: searchParams.get("entityType") as "vc" | "startup" | null,
    page: searchParams.get("page"),
    rounds: searchParams.get("rounds"),
    endMarkets: searchParams.get("endMarkets"),
    companyStatuses: searchParams.get("companyStatuses")
  }), [searchParams])

  const updateURL = useCallback((params: URLParams) => {
    const url = new URL(window.location.href)

    // Clear existing parameters if no params provided or explicitly clearing
    if (Object.keys(params).length === 1 && params.page === "1" && !params.location) {
      // This is a clear filter operation - remove all filter-related params
      url.searchParams.delete('location')
      url.searchParams.delete('filterType')
      url.searchParams.delete('entityType')
      url.searchParams.delete('rounds')
      url.searchParams.delete('endMarkets')
      url.searchParams.delete('companyStatuses')
      url.searchParams.set('page', '1')
    } else {
      // Add/update new parameters (only non-null values)
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          url.searchParams.set(key, value)
        } else {
          // Remove parameter if value is null
          url.searchParams.delete(key)
        }
      })
    }

    const newPath = `${url.pathname}${url.search}`
    window.history.pushState({}, "", newPath)
  }, [])

  return {
    ...params,
    updateURL,
    router,
  }
}
