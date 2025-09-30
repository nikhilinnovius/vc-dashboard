// "use client"

// import { useState, useEffect, useCallback, useMemo, Suspense } from "react"
// import { useSession } from "next-auth/react"
// import { useCustomAuth } from "@/hooks/use-custom-auth"
// import { useRouter, useSearchParams } from "@/navigation"
// import Image from "next/image"
// import { LogIn, LogOut, X, ChevronDown, Filter, FileText, Loader2 } from "lucide-react"
// import { motion, AnimatePresence } from "framer-motion"
// import { useTheme } from "@/components/theme-provider"
// import { PreferencesDialog } from "@/components/preferences-dialog"
// import { useData } from "@/context/data-context"
// import { LocationFilterModal } from "@/components/location-filter-modal"
// import { FilterStartupsModal } from "@/components/filter-startups-modal"
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuCheckboxItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
// import { GridView } from "@/components/vc-dashboard/core/GridView"
// import { FastVCPortfolio } from "@/components/fast-vc-portfolio"
// import { StartupDetails } from "@/components/startup-details"
// import { SaveButton } from "@/components/save-button"
// import { NonQualifiedStartupList } from "@/components/nonqualified-startup-list"
// import { PortfolioSearch } from "@/components/portfolio-search"
// import { GiveawayPopup } from "@/components/giveaway-popup"
// import { getGiveawayDataForVC, sortVCsByPortfolioScore } from "@/lib/data-utils"
// import { AffinityNotes } from "@/components/affinity-notes"
// import { CompanyLogo } from "@/components/company-logo"
// import { useToast } from "@/components/ui/use-toast"
// import { NonQualifiedStartupCard } from "@/components/nonqualified-startup-card"
// import { VCGridSkeleton, StartupGridSkeleton } from "@/components/skeleton-components"
// import { StageDistributionPills } from "@/components/stage-distribution-pills"
// import { BackToAthenaButton } from "@/components/back-to-athena-button"
// import { FilterSection } from "@/components/vc-dashboard/core/FilterTab"
// import { TooltipProvider } from "@radix-ui/react-tooltip"

// // Types
// interface FilterState {
//   type: "state" | "city" | null
//   value: string | null
// }

// interface URLParams {
//   vc?: string | null
//   startup?: string | null
//   entityType?: string | null
//   filterType?: string | null
//   location?: string | null
//   saved?: string | null
//   page?: string | null
// }

// export const capitalizeFirstLetter = (string: string) => {
//   if (!string) return ""
//   return string.charAt(0).toUpperCase() + string.slice(1)
// }

// // ✅ FIXED: Optimized saved items hook without circular dependencies
// const useSavedItems = (status: string) => {
//   const [savedVCs, setSavedVCs] = useState<string[]>([])
//   const [savedStartups, setSavedStartups] = useState<string[]>([])
//   const [isLoading, setIsLoading] = useState(false)

//   // ✅ FIXED: Remove isLoading from dependencies - stable functions
//   const fetchSavedVCs = useCallback(async () => {
//     try {
//       const response = await fetch("/api/vcs/saved", {
//         cache: "force-cache",
//         next: { revalidate: 60 },
//       })
//       if (response.ok) {
//         const data = await response.json()
//         setSavedVCs(Array.isArray(data.savedVCs) ? data.savedVCs : [])
//       }
//     } catch (error) {
//       console.error("Failed to fetch saved VCs:", error)
//     }
//   }, []) // ✅ Empty dependencies - stable function

//   const fetchSavedStartups = useCallback(async () => {
//     try {
//       const response = await fetch("/api/startups/saved", {
//         cache: "force-cache",
//         next: { revalidate: 60 },
//       })
//       if (response.ok) {
//         const data = await response.json()
//         setSavedStartups(Array.isArray(data.savedStartups) ? data.savedStartups : [])
//       }
//     } catch (error) {
//       console.error("Failed to fetch saved startups:", error)
//     }
//   }, []) // ✅ Empty dependencies - stable function

//   // ✅ FIXED: Only depend on status, not the functions
//   useEffect(() => {
//     if (status === "authenticated") {
//       setIsLoading(true)
//       Promise.all([fetchSavedVCs(), fetchSavedStartups()]).finally(() => setIsLoading(false))
//     }
//   }, [status]) // ✅ Remove fetchSavedVCs, fetchSavedStartups from dependencies

//   return {
//     savedVCs,
//     savedStartups,
//     setSavedVCs,
//     setSavedStartups,
//     fetchSavedVCs,
//     fetchSavedStartups,
//     isLoading, // Add this for better UX
//   }
// }

// const useURLState = () => {
//   const router = useRouter()
//   const searchParams = useSearchParams()

//   const selectedVC = searchParams.get("vc")
//   const selectedStartup = searchParams.get("startup")
//   const filterType = searchParams.get("filterType") as "state" | "city" | null
//   const locationFilter = searchParams.get("location")
//   const viewingSaved = searchParams.get("saved") as "vcs" | "startups" | null
//   const entityType = searchParams.get("entityType") as "vc" | "startup" | null
//   const page = searchParams.get("page")

//   const updateURL = useCallback((params: URLParams) => {
//     const url = new URL(window.location.href)

//     // Clear existing parameters
//     for (const key of url.searchParams.keys()) {
//       url.searchParams.delete(key)
//     }

//     // Add new parameters (only non-null values)
//     Object.entries(params).forEach(([key, value]) => {
//       if (value !== null && value !== undefined) {
//         url.searchParams.set(key, value)
//       }
//     })

//     const newPath = `${url.pathname}${url.search}`
//     window.history.pushState({}, "", newPath)
//   }, [])

//   return {
//     selectedVC,
//     selectedStartup,
//     filterType,
//     locationFilter,
//     viewingSaved,
//     entityType,
//     page,
//     updateURL,
//     router,
//   }
// }

// // Optimized loading component with skeleton states
// const LoadingIndicator = ({ entityType, showSkeleton = true }: { entityType?: string; showSkeleton?: boolean }) => {
//   if (showSkeleton) {
//     return (
//       <div className="space-y-6">
//         <div className="flex items-center justify-between">
//           <div className="space-y-2">
//             <div className="h-8 w-64 bg-white/20 rounded animate-pulse" />
//             <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
//           </div>
//         </div>
//         {entityType === "startup" ? <StartupGridSkeleton count={12} /> : <VCGridSkeleton count={12} />}
//       </div>
//     )
//   }

//   return (
//     <div className="flex flex-col items-center justify-center py-20">
//       <Loader2 className="h-12 w-12 text-white animate-spin mb-4" />
//       <p className="text-white text-xl">{entityType === "startup" ? "Loading Startups..." : "Loading VCs..."}</p>
//     </div>
//   )
// }

// const ErrorDisplay = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
//   <div className="flex flex-col items-center justify-center py-10">
//     <p className="text-white text-xl mb-4">Error loading data</p>
//     <p className="text-white/70 mb-6 max-w-md text-center">
//       {error || "An unexpected error occurred. Please try again."}
//     </p>
//     <Button onClick={onRetry} className="bg-white/20 text-white hover:bg-white/30">
//       Try Again
//     </Button>
//   </div>
// )

// // Add this component at the end of your file, outside the DashboardContent function:
// const SavedNonQualifiedStartupsSection = ({ userId }: { userId: string }) => {
//   const { nonQualifiedStartups } = useData()
//   const [savedIds, setSavedIds] = useState<string[]>([])
//   const [loading, setLoading] = useState(true)
//   const { toast } = useToast()

//   useEffect(() => {
//     async function fetchSavedIds() {
//       try {
//         const response = await fetch("/api/nonqualified/saved")
//         if (response.ok) {
//         // Add this new state to track search context
//         // In DashboardContent component, around line 445 with other state declarations
//           const data = await response.json()
//           setSavedIds(data.savedStartups || [])
//         }
//       } catch (error) {
//         console.error("Error fetching saved non-qualified startups:", error)
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchSavedIds()
//   }, [])

//   if (loading) {
//     return <div className="mt-8 text-white">Loading saved remaining portfolio...</div>
//   }

//   if (savedIds.length === 0) {
//     return null
//   }

//   const matchingStartups = nonQualifiedStartups.filter((startup) => savedIds.includes(startup.id))
//   const uniqueStartups = Array.from(new Map(matchingStartups.map((startup) => [startup.name, startup])).values())

//   if (uniqueStartups.length === 0) {
//     return (
//       <div className="mt-12 p-4 bg-gray-800/50 rounded-lg">
//         <h2 className="text-xl font-bold text-white mb-2">Saved Remaining Portfolio</h2>
//         <p className="text-white/80">
//           You have {savedIds.length} saved remaining portfolio startups, but they couldn't be matched with the current
//           data.
//         </p>
//         <div className="mt-2 text-sm text-white/60">Saved IDs: {savedIds.join(", ")}</div>
//       </div>
//     )
//   }

//   return (
//     <div className="mt-12">
//       <h2 className="text-2xl font-bold text-white mb-6">
//         Saved Remaining Portfolio
//         <span className="ml-2 text-base font-normal text-white/60">
//           {uniqueStartups.length} {uniqueStartups.length === 1 ? "startup" : "startups"}
//         </span>
//       </h2>

//       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4 auto-rows-fr">
//         {uniqueStartups.map((startup, index) => (
//           <motion.div
//             key={startup.id}
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.2, delay: Math.min(0.03 * index, 0.15) }}
//             className="h-full"
//           >
//             <NonQualifiedStartupCard
//               startup={{
//                 ...startup,
//                 raisePredictor: startup.raisePredictor,
//               }}
//               isSaved={true}
//               onSaveChange={(startupId, saved) => {
//                 const endpoint = `/api/nonqualified/${saved ? "save" : "unsave"}`
//                 fetch(endpoint, {
//                   method: "POST",
//                   headers: { "Content-Type": "application/json" },
//                   body: JSON.stringify({ id: startupId }),
//                 })
//                   .then((response) => {
//                     if (response.ok) {
//                       if (!saved) {
//                         setSavedIds((prev) => prev.filter((id) => id !== startupId))
//                       }
//                       toast({
//                         title: `${saved ? "Saved" : "Unsaved"} startup`,
//                         description: saved ? "Startup added to saved items" : "Startup removed from saved items",
//                       })
//                     }
//                   })
//                   .catch((error) => {
//                     console.error("Error saving/unsaving:", error)
//                     toast({
//                       title: "Error",
//                       description: `Failed to ${saved ? "save" : "unsave"} startup`,
//                       variant: "destructive",
//                     })
//                   })
//               }}
//             />
//           </motion.div>
//         ))}
//       </div>
//     </div>
//   )
// }

// // Main Dashboard Content Component with optimizations
// export default function VCDashboard() {
//   const { theme, setTheme } = useTheme()
//   const { data: session, status } = useSession()
//   const customAuth = useCustomAuth()
  
//   // Use custom auth if available, otherwise fall back to NextAuth
//   // TEMPORARY: Hardcode for testing: TODO: Remove after testing
//   const isAuthenticated = true // customAuth.status === 'authenticated' || status === 'authenticated'
//   const currentSession = customAuth.status === 'authenticated' ? customAuth : {
//     user: { email: 'test@example.com', name: 'Test User' },
//     status: 'authenticated'
//   }
  
//   // Debug logging
//   console.log('🔍 Auth Debug:', {
//     customAuthStatus: customAuth.status,
//     nextAuthStatus: status,
//     isAuthenticated,
//     customAuth,
//     nextAuthSession: session
//   })

//   // ✅ OPTIMIZATION: Only load full CSV data when actually needed
//   const { selectedVC, selectedStartup, filterType, locationFilter, viewingSaved, entityType, page, updateURL, router } =
//     useURLState()

//   // ✅ OPTIMIZATION: Only load full CSV data when actually needed
//   const shouldLoadFullData = selectedVC || selectedStartup || viewingSaved === "startups" || entityType === "startup"
  
//   // ✅ NEW: Track VC count from VCList component
//   const [vcCount, setVcCount] = useState(0)
  
//   // ✅ NEW: Track when data is being loaded for selected VC
//   const [isDataLoading, setIsDataLoading] = useState(false)
//   const {
//     startups,
//     nonQualifiedStartups,
//     giveawayData,
//     locations,
//     isLoading: isLoadingData,
//     hasInitialData,
//     error: dataError,
//     refetch,
//     vcs, // Only used for selected VC details, not main list
//   } = shouldLoadFullData ? useData() : {
//     startups: [],
//     nonQualifiedStartups: [],
//     giveawayData: [],
//     locations: { states: [], cities: [] },
//     isLoading: false,
//     hasInitialData: true,
//     error: null,
//     refetch: async () => {},
//     vcs: [],
//   }

//   // Load data when needed
//   useEffect(() => {
//     if (shouldLoadFullData && !hasInitialData && !isLoadingData) {
//       setIsDataLoading(true)
//       refetch().finally(() => setIsDataLoading(false))
//     }
//   }, [shouldLoadFullData, hasInitialData, isLoadingData, refetch])
  
//   // ✅ NEW: Clear loading state when data is ready (but only if not from VC selection)
//   useEffect(() => {
//     if (hasInitialData && startups.length > 0 && !selectedVC) {
//       setIsDataLoading(false)
//     }
//   }, [hasInitialData, startups.length, selectedVC])
  
//   // ✅ NEW: Clear loading state when VC portfolio data is ready
//   useEffect(() => {
//     if (selectedVC && hasInitialData && startups.length > 0) {
//       // Small delay to ensure skeleton is visible briefly
//       const timer = setTimeout(() => {
//         setIsDataLoading(false)
//       }, 300)
//       return () => clearTimeout(timer)
//     }
//   }, [selectedVC, hasInitialData, startups.length])

//   const {
//     savedVCs,
//     savedStartups,
//     setSavedVCs,
//     setSavedStartups,
//     fetchSavedVCs,
//     fetchSavedStartups,
//     isLoading: isSavedItemsLoading,
//   } = useSavedItems(isAuthenticated ? 'authenticated' : 'unauthenticated')

//   // Local state with optimizations
//   const [localEntityType, setLocalEntityType] = useState<"vc" | "startup" | null>(entityType)
//   const [preferencesOpen, setPreferencesOpen] = useState(false)
//   const [localError, setLocalError] = useState<string | null>(null)
//   const [locationFilterOpen, setLocationFilterOpen] = useState(false)
//   const [isNoteOpen, setIsNoteOpen] = useState(false)
//   const [filterStartupsModalOpen, setFilterStartupsModalOpen] = useState(false)
//   const [isViewTransitioning, setIsViewTransitioning] = useState(false)
//   // Pagination state
//   const [currentPage, setCurrentPage] = useState(1)
//   const itemsPerPage = 20
//   const [lastRoundFilter, setLastRoundFilter] = useState<string | null>(null)
//   const [statusFilter, setstatusFilter] = useState<string | null>(null)
//   const [endMarketFilters, setEndMarketFilters] = useState<string[]>([])
//   const [isFromSearch, setIsFromSearch] = useState(false) // ADD THIS HERE


//   // ✅ FIXED: Memoize filter object to prevent infinite re-renders
//   const memoizedFilter = useMemo(
//     () => ({
//       type: filterType,
//       value: locationFilter,
//     }),
//     [filterType, locationFilter],
//   )

//   // Optimized computed values with better memoization
//   const filteredVCs = useMemo(() => {
//     if (!vcs) return []

//     let filtered = [...vcs]

//     if (filterType && locationFilter) {
//       const locations = locationFilter.split(",").map((loc) => loc.trim())
//       filtered = filtered.filter((vc) => {
//         if (filterType === "city") {
//           return locations.includes(vc.city)
//         }
//         if (filterType === "state") {
//           return locations.includes(vc.state)
//         }
//         return true
//       })
//     }

//     // Sort by portfolio company score (pre-calculated from CSV)
//     return sortVCsByPortfolioScore(filtered)
//   }, [vcs, filterType, locationFilter])

//   const scoredVCs = useMemo(() => {
//     // VCs are already sorted by portfolio score, no need for additional calculation
//     return filteredVCs
//   }, [filteredVCs])

//   const filteredStartups = useMemo(() => {
//     if (!startups) return []

//     let filtered = startups

//     if (filterType && locationFilter) {
//       const locations = locationFilter.split(",").map((loc) => loc.trim())
//       filtered = filtered.filter((startup) => {
//         if (filterType === "city") {
//           return locations.includes(startup.city)
//         }
//         if (filterType === "state") {
//           return locations.includes(startup.state)
//         }
//         return true
//       })
//     }

//     if (!selectedVC && localEntityType === "startup") {
//       const uniqueStartups = new Map()
//       filtered.forEach((startup) => {
//         if (!uniqueStartups.has(startup.name)) {
//           uniqueStartups.set(startup.name, startup)
//         }
//       })
//       return Array.from(uniqueStartups.values())
//     }

//     return filtered
//   }, [startups, filterType, locationFilter, selectedVC, localEntityType])

//   const fullyFilteredStartupsCount = useMemo(() => {
//     if (!filteredStartups) return 0

//     let filtered = [...filteredStartups]

//     if (lastRoundFilter) {
//       filtered = filtered.filter((startup) => startup.lastRound === lastRoundFilter)
//     }

//     if (statusFilter) {
//       filtered = filtered.filter((startup) => startup.status === statusFilter)
//     }

//     if (endMarketFilters && endMarketFilters.length > 0) {
//       filtered = filtered.filter((startup) => {
//         if (!startup.endMarket) return false
//         const startupMarkets = startup.endMarket.split(",").map((market: string) => market.trim())
//         return endMarketFilters.some((filter: string) => startupMarkets.includes(filter))
//       })
//     }

//     return filtered.length
//   }, [filteredStartups, lastRoundFilter, statusFilter, endMarketFilters])

//   const savedStartupsCount = useMemo(() => {
//     if (!filteredStartups || !savedStartups) return 0
//     const uniqueSavedStartups = new Map()
//     filteredStartups.forEach((startup) => {
//       if (savedStartups.includes(startup.name) && !uniqueSavedStartups.has(startup.name)) {
//         uniqueSavedStartups.set(startup.name, startup)
//       }
//     })
//     return uniqueSavedStartups.size
//   }, [filteredStartups, savedStartups])

//   // Effects with optimizations
//   useEffect(() => {
//     setLocalEntityType(entityType)
//     setIsViewTransitioning(false)
//   }, [entityType])

//   useEffect(() => {
//     if (dataError) {
//       console.error("Data error:", dataError)
//       setLocalError(typeof dataError === "string" ? dataError : "Error loading data")
//     } else {
//       setLocalError(null)
//     }
//   }, [dataError])

//   useEffect(() => {
//     const handlePopState = () => {
//       router.refresh()
//     }
//     window.addEventListener("popstate", handlePopState)
//     return () => window.removeEventListener("popstate", handlePopState)
//   }, [router])

//   useEffect(() => {
//     if (!filterType && locationFilter) {
//       const url = new URL(window.location.href)
//       url.searchParams.delete("location")
//       window.history.pushState({}, "", url.toString())
//       router.refresh()
//     }
//   }, [filterType, locationFilter, router])

//   // Replace this useEffect:
//   useEffect(() => {
//     const pageFromUrl = page
//     if (pageFromUrl) {
//       const parsedPage = Number.parseInt(pageFromUrl, 10)
//       if (!isNaN(parsedPage) && parsedPage > 0) {
//         setCurrentPage(parsedPage)
//       }
//     } else {
//       setCurrentPage(1)
//     }
//   }, [page])

//   // Optimized event handlers
//   const handleSaveChange = useCallback(
//     async (vcId: string, saved: boolean) => {
//       if (!vcId) return

//       const endpoint = `/api/vcs/${saved ? "save" : "unsave"}`
//       try {
//         const response = await fetch(endpoint, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ id: vcId }),
//         })
//         if (response.ok) {
//           // Update local state immediately for better UX
//           if (saved) {
//             setSavedVCs((prev) => [...prev, vcId])
//           } else {
//             setSavedVCs((prev) => prev.filter((id) => id !== vcId))
//           }
//           // Force refresh of saved VCs data if we're viewing saved VCs
//           if (viewingSaved === "vcs") {
//             await fetchSavedVCs()
//           }
//         } else {
//           setLocalError("Failed to update saved status")
//         }
//       } catch (error) {
//         console.error("Failed to update saved status:", error)
//         setLocalError("Failed to update saved status")
//       }
//     },
//     [fetchSavedVCs, setSavedVCs, viewingSaved], // Add viewingSaved to dependencies
//   )

//   const handleVCSelect = useCallback(
//     (vc: string) => {
//       if (!vc) return
      
//       // ✅ NEW: Always set loading state when VC is selected to show skeleton immediately
//       setIsDataLoading(true)
      
//       window.scrollTo({ top: 0, behavior: "smooth" })
//       router.push(`/?vc=${encodeURIComponent(vc)}`)
//     },
//     [router],
//   )

//   const handleStartupSelect = useCallback(
//     (startup: string, fromSearch = false) => {
//       console.log('🔍 handleStartupSelect called with:', startup, 'fromSearch:', fromSearch)
//       if (!startup) return
//       window.scrollTo({ top: 0, behavior: "smooth" })
      
//       setIsFromSearch(fromSearch)
      
//       updateURL({
//         startup,
//         vc: selectedVC,
//         saved: viewingSaved,
//         filterType: filterType,
//         location: locationFilter,
//         entityType: localEntityType,
//       })
//     },
//     [updateURL, selectedVC, viewingSaved, filterType, locationFilter, localEntityType, setIsFromSearch],
//   )

//   const clearFilter = useCallback(() => {
//     const currentEntityType = entityType || "vc"
//     setLastRoundFilter(null)
//     setstatusFilter(null)
//     setEndMarketFilters([])
//     setCurrentPage(1) // Reset to first page when clearing filters

//     const url = new URL(window.location.href)
//     url.searchParams.delete("filterType")
//     url.searchParams.delete("location")
//     url.searchParams.set("page", "1") // Reset page parameter

//     if (currentEntityType) {
//       url.searchParams.set("entityType", currentEntityType)
//     }
//     if (viewingSaved) {
//       url.searchParams.set("saved", viewingSaved)
//     }

//     window.history.pushState({}, "", url.toString())
//     router.refresh()
//   }, [entityType, viewingSaved, router])

//   const resetToHome = useCallback(() => {
//     setLocalEntityType(null)
//     updateURL({
//       vc: null,
//       startup: null,
//       entityType: null,
//       filterType: null,
//       location: null,
//       saved: null,
//     })
//   }, [updateURL])


//   const handleRetry = useCallback(() => {
//     setLocalError(null)
//     refetch()
//   }, [refetch])


//   const handleApplyLocationFilters = useCallback(
//     ({
//       entityType,
//       locationType,
//       locations,
//     }: {
//       entityType: "vc" | "startup"
//       locationType: "state" | "city"
//       locations: string[]
//     }) => {
//       setIsViewTransitioning(true)
//       setLocalEntityType(entityType)

//       const params: URLParams = {
//         entityType,
//         filterType: locationType,
//         location: locations.join(","),
//         saved: null,
//         vc: null,
//         startup: null,
//       }

//       updateURL(params)
//     },
//     [updateURL],
//   )

//   const getUniqueLastRounds = useCallback(
//     (vcId: string) => {
//       if (!startups || !Array.isArray(startups)) return []
//       const vcStartups = startups.filter((startup) => startup.vcId === vcId)
//       const uniqueRounds = new Set<string>()
//       vcStartups.forEach((startup) => {
//         if (startup.lastRound && startup.lastRound.trim()) {
//           uniqueRounds.add(startup.lastRound.trim())
//         }
//       })
//       return Array.from(uniqueRounds).sort()
//     },
//     [startups],
//   )

//   const getUniqueStatuses = useCallback(
//     (vcId: string) => {
//       if (!startups || !Array.isArray(startups)) return []
//       const vcStartups = startups.filter((startup) => startup.vcId === vcId)
//       const uniqueStatuses = new Set<string>()
//       vcStartups.forEach((startup) => {
//         if (startup.status && startup.status.trim()) {
//           uniqueStatuses.add(startup.status.trim())
//         }
//       })
//       return Array.from(uniqueStatuses).sort()
//     },
//     [startups],
//   )

//   const getUniqueEndMarkets = useCallback(
//     (vcId: string) => {
//       if (!startups || !Array.isArray(startups)) return []
//       const vcStartups = startups.filter((startup) => startup.vcId === vcId)
//       const uniqueMarkets = new Set<string>()
//       vcStartups.forEach((startup) => {
//         if (startup.endMarket && startup.endMarket.trim()) {
//           const markets = startup.endMarket.split(",").map((market) => market.trim())
//           markets.forEach((market) => {
//             if (market) uniqueMarkets.add(market)
//           })
//         }
//       })
//       return Array.from(uniqueMarkets).sort()
//     },
//     [startups],
//   )

//   // Combine all errors
//   const displayError = localError || (dataError ? String(dataError) : null)

//   // Show immediate UI with skeleton states while data loads
//   const shouldShowSkeleton = (isLoadingData && !hasInitialData) || isDataLoading

//   return (
//     <div className="flex min-h-screen flex-col p-3 sm:p-6 lg:p-8">

//         {isAuthenticated ? (
//           <>
//             <LocationFilterModal
//               isOpen={locationFilterOpen}
//               onOpenChange={setLocationFilterOpen}
//               onApplyFilters={handleApplyLocationFilters}
//             />

//             <FilterStartupsModal
//               isOpen={filterStartupsModalOpen}
//               onOpenChange={setFilterStartupsModalOpen}
//               initialFilters={{
//                 locationType: filterType,
//                 locations: locationFilter ? locationFilter.split(",") : [],
//                 lastRound: lastRoundFilter,
//                 companyStatus: statusFilter,
//                 endMarkets: endMarketFilters,
//               }}
//               onApplyFilters={({ locationType, locations, lastRound, companyStatus, endMarkets }) => {
//                 const url = new URL(window.location.href)
//                 url.searchParams.delete("filterType")
//                 url.searchParams.delete("location")

//                 if (locationType && locations.length > 0) {
//                   url.searchParams.set("filterType", locationType)
//                   url.searchParams.set("location", locations.join(","))
//                 }

//                 if (localEntityType !== "startup") {
//                   setLocalEntityType("startup")
//                   url.searchParams.set("entityType", "startup")
//                 }

//                 setLastRoundFilter(lastRound)
//                 setstatusFilter(companyStatus)
//                 setEndMarketFilters(endMarkets)

//                 window.history.pushState({}, "", url.toString())
//                 router.refresh()
//               }}
//             />

//             {/* Show error if there's one, but don't block the UI */}
//             {displayError && !shouldShowSkeleton && <ErrorDisplay error={displayError} onRetry={handleRetry} />}

//             {/* Always show UI - either with data or skeleton states */}
//             <>
//               {!selectedVC && !selectedStartup && !viewingSaved && (
//                 <FilterSection
//                   filterType={filterType}
//                   locationFilter={locationFilter}
//                   localEntityType={localEntityType}
//                   onClearFilter={clearFilter}
//                   onUpdateURL={updateURL}
//                   onFilterStartupsModalOpen={() => setFilterStartupsModalOpen(true)}
//                   fullyFilteredStartupsCount={fullyFilteredStartupsCount}
//                   filteredStartupsLength={filteredStartups.length}
//                   filteredVCsCount={vcCount}
//                   viewingSaved={viewingSaved}
//                 />
//               )}

//               {isViewTransitioning ? (
//                 <LoadingIndicator entityType={localEntityType || undefined} showSkeleton={true} />
//               ) : (
//                 <AnimatePresence mode="wait" initial={false}>
//                   {/* ✅ FIXED: Single conditional rendering to prevent multiple VCList instances */}
//                   {!selectedVC && !selectedStartup && !viewingSaved && (
//                     <motion.div
//                       key={localEntityType || "vc"}
//                       initial={{ opacity: 0 }}
//                       animate={{ opacity: 1 }}
//                       exit={{ opacity: 0 }}
//                       transition={{ duration: 0.15 }}
//                     >
//                       {localEntityType === "startup" ? (
//                         shouldShowSkeleton ? (
//                           <StartupGridSkeleton count={12} />
//                         ) : (
//                           <GridView
//                             type="startup"
//                             filter={memoizedFilter}
//                             onItemSelect={handleStartupSelect}
//                             savedItems={savedStartups}
//                             onSaveChange={async (startupName, saved) => {
//                               try {
//                                 const endpoint = `/api/startups/${saved ? "save" : "unsave"}`
//                                 const response = await fetch(endpoint, {
//                                   method: "POST",
//                                   headers: { "Content-Type": "application/json" },
//                                   body: JSON.stringify({ id: startupName }),
//                                 })

//                                 if (response.ok) {
//                                   if (saved) {
//                                     setSavedStartups((prev) => [...prev, startupName])
//                                   } else {
//                                     setSavedStartups((prev) => prev.filter((name) => name !== startupName))
//                                   }
//                                 }
//                               } catch (error) {
//                                 console.error("Failed to update saved status:", error)
//                               }
//                             }}
//                             lastRoundFilter={lastRoundFilter}
//                             statusFilter={statusFilter}
//                             endMarketFilters={endMarketFilters}
//                             isPortfolio={true}
//                             externalData={filteredStartups}
//                           />
//                         )
//                       ) : shouldShowSkeleton ? (
//                         <VCGridSkeleton count={12} />
//                       ) : (
//                         <GridView
//                           type="vc"
//                           filter={memoizedFilter}
//                           onItemSelect={handleVCSelect}
//                           savedItems={savedVCs}
//                           onSaveChange={handleSaveChange}
//                           onTotalItemsChange={setVcCount}
//                         />
//                       )}
//                     </motion.div>
//                   )}

//                   {selectedVC && !selectedStartup && (
//                     <motion.div
//                       key="startupList"
//                       initial={{ opacity: 0 }}
//                       animate={{ opacity: 1 }}
//                       exit={{ opacity: 0 }}
//                       transition={{ duration: 0.15 }}
//                     >
//                       <div className="mb-4 mt-8">
//                         <Button
//                           variant="outline"
//                           onClick={resetToHome}
//                           className="bg-white/10 text-white hover:bg-white/20 border-white/20"
//                         >
//                           ← Back to VCs
//                         </Button>
//                       </div>
//                       <div className="mb-6 mt-4">
//                         <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
//                           <div className="flex items-center gap-2">
//                             {selectedVC && (
//                               <div className="flex-shrink-0">
//                                 {(() => {
//                                   const vcData = vcs.find((v) => v.name === selectedVC)
//                                   const website = vcData?.website

//                                   if (website) {
//                                     return (
//                                       <a
//                                         href={website.startsWith("http") ? website : `https://${website}`}
//                                         target="_blank"
//                                         rel="noopener noreferrer"
//                                         className="block hover:opacity-80 transition-opacity duration-200 cursor-pointer"
//                                         title={`Visit ${selectedVC} website`}
//                                       >
//                                         <CompanyLogo
//                                           domain={website}
//                                           name={selectedVC}
//                                           size={48}
//                                           type="vc"
//                                           className="flex-shrink-0"
//                                         />
//                                       </a>
//                                     )
//                                   } else {
//                                     return (
//                                       <CompanyLogo
//                                         domain=""
//                                         name={selectedVC}
//                                         size={48}
//                                         type="vc"
//                                         className="flex-shrink-0"
//                                       />
//                                     )
//                                   }
//                                 })()}
//                               </div>
//                             )}
//                             <div>
//                               <h2 className="text-2xl sm:text-3xl font-bold text-white break-words">
//                                 {selectedVC} Portfolio
//                               </h2>
//                               {startups.filter(
//                                 (s) => s.vcId === `vc-${selectedVC.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
//                               ).length > 0 && (
//                                 <div className="flex items-center gap-3 text-base font-normal text-white/60">
//                                   {(() => {
//                                     const vcData = vcs.find((v) => v.name === selectedVC)
//                                     const startupCount = startups.filter(
//                                       (s) => s.vcId === `vc-${selectedVC.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
//                                     ).length

//                                     return (
//                                       <>
//                                         {vcData?.portfolioCompanyScore && (
//                                           <>
//                                             <span>Score: {Math.round(vcData.portfolioCompanyScore)}</span>
//                                             <span className="text-white/40">|</span>
//                                           </>
//                                         )}
//                                         <span>
//                                           {startupCount} {startupCount === 1 ? "startup" : "startups"}
//                                         </span>
//                                         {vcData?.aum && (
//                                           <>
//                                             <span className="text-white/40">|</span>
//                                             <span>AUM: {vcData.aum}</span>
//                                           </>
//                                         )}
//                                       </>
//                                     )
//                                   })()}
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                           <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
//                             <Button
//                               variant="outline"
//                               size="icon"
//                               onClick={(e) => {
//                                 e.stopPropagation()
//                                 setIsNoteOpen(true)
//                               }}
//                               className="bg-white/20 hover:bg-white/30 text-white h-10 w-10"
//                             >
//                               <FileText className="h-5 w-5" />
//                             </Button>
//                             <SaveButton
//                               itemId={vcs.find((v) => v.name === selectedVC)?.id || ""}
//                               itemType="vc"
//                               initialSaved={savedVCs.includes(vcs.find((v) => v.name === selectedVC)?.id || "")}
//                               onSaveChange={(saved) => {
//                                 const vcId = vcs.find((v) => v.name === selectedVC)?.id
//                                 if (vcId) handleSaveChange(vcId, saved)
//                               }}
//                               className="bg-white/20 hover:bg-white/30 transition-colors duration-200"
//                             />
//                             {selectedVC && (
//                               <GiveawayPopup
//                                 vcData={getGiveawayDataForVC(
//                                   giveawayData,
//                                   vcs.find((v) => v.name === selectedVC)?.website || "",
//                                 )}
//                                 vcName={selectedVC}
//                                 vcWebsite={vcs.find((v) => v.name === selectedVC)?.website || ""}
//                               />
//                             )}
//                             <PortfolioSearch
//                               vcId={`vc-${selectedVC.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
//                               onStartupSelect={handleStartupSelect}
//                             />

//                             {/* Filter dropdowns */}
//                             <DropdownMenu>
//                               <DropdownMenuTrigger asChild>
//                                 <Button
//                                   variant="outline"
//                                   size="sm"
//                                   className={`bg-white/10 text-white hover:bg-white/20 border-white/20 ${lastRoundFilter ? "ring-2 ring-blue-500" : ""}`}
//                                 >
//                                   <Filter className="h-4 w-4 mr-2" />
//                                   <span className="hidden sm:inline">
//                                     {lastRoundFilter ? `Round: ${lastRoundFilter}` : "Filter Rounds"}
//                                   </span>
//                                 </Button>
//                               </DropdownMenuTrigger>
//                               <DropdownMenuContent align="end">
//                                 <DropdownMenuLabel>Filter by Last Round</DropdownMenuLabel>
//                                 <DropdownMenuSeparator />
//                                 {selectedVC &&
//                                   getUniqueLastRounds(`vc-${selectedVC.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`).map(
//                                     (round) => (
//                                       <DropdownMenuItem
//                                         key={round}
//                                         onClick={() => {
//                                           setLastRoundFilter(null)
//                                           setTimeout(() => {
//                                             setLastRoundFilter(round)
//                                           }, 10)
//                                         }}
//                                         className={
//                                           lastRoundFilter === round ? "bg-blue-50 text-blue-600 font-medium" : ""
//                                         }
//                                       >
//                                         {round}
//                                       </DropdownMenuItem>
//                                     ),
//                                   )}
//                                 {lastRoundFilter && (
//                                   <>
//                                     <DropdownMenuSeparator />
//                                     <DropdownMenuItem onClick={() => setLastRoundFilter(null)}>
//                                       Clear Filter
//                                     </DropdownMenuItem>
//                                   </>
//                                 )}
//                               </DropdownMenuContent>
//                             </DropdownMenu>

//                             <DropdownMenu>
//                               <DropdownMenuTrigger asChild>
//                                 <Button
//                                   variant="outline"
//                                   size="sm"
//                                   className={`bg-white/10 text-white hover:bg-white/20 border-white/20 ${statusFilter ? "ring-2 ring-green-500" : ""}`}
//                                 >
//                                   <Filter className="h-4 w-4 mr-2" />
//                                   <span className="hidden sm:inline">
//                                     {statusFilter ? `Status: ${statusFilter}` : "Filter Status"}
//                                   </span>
//                                 </Button>
//                               </DropdownMenuTrigger>
//                               <DropdownMenuContent align="end">
//                                 <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
//                                 <DropdownMenuSeparator />
//                                 {selectedVC &&
//                                   getUniqueStatuses(
//                                     `vc-${selectedVC.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
//                                   ).map((status) => (
//                                     <DropdownMenuItem
//                                       key={status}
//                                       onClick={() => {
//                                         setstatusFilter(null)
//                                         setTimeout(() => {
//                                           setstatusFilter(status)
//                                         }, 10)
//                                       }}
//                                       className={
//                                         statusFilter === status ? "bg-green-50 text-green-600 font-medium" : ""
//                                       }
//                                     >
//                                       {status}
//                                     </DropdownMenuItem>
//                                   ))}
//                                 {statusFilter && (
//                                   <>
//                                     <DropdownMenuSeparator />
//                                     <DropdownMenuItem onClick={() => setstatusFilter(null)}>
//                                       Clear Filter
//                                     </DropdownMenuItem>
//                                   </>
//                                 )}
//                               </DropdownMenuContent>
//                             </DropdownMenu>

//                             <DropdownMenu>
//                               <DropdownMenuTrigger asChild>
//                                 <Button
//                                   variant="outline"
//                                   size="sm"
//                                   className={`bg-white/10 text-white hover:bg-white/20 border-white/20 ${endMarketFilters.length > 0 ? "ring-2 ring-purple-500" : ""}`}
//                                 >
//                                   <Filter className="h-4 w-4 mr-2" />
//                                   <span className="hidden sm:inline">
//                                     {endMarketFilters.length > 0
//                                       ? `Markets: ${endMarketFilters.length}`
//                                       : "Filter Markets"}
//                                   </span>
//                                 </Button>
//                               </DropdownMenuTrigger>
//                               <DropdownMenuContent align="end" className="w-[220px]">
//                                 <DropdownMenuLabel>Filter by End Market</DropdownMenuLabel>
//                                 <DropdownMenuSeparator />
//                                 <div className="max-h-[200px] overflow-y-auto">
//                                   {selectedVC &&
//                                     getUniqueEndMarkets(
//                                       `vc-${selectedVC.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
//                                     ).map((market) => (
//                                       <DropdownMenuCheckboxItem
//                                         key={market}
//                                         checked={endMarketFilters.includes(market)}
//                                         onSelect={(e) => {
//                                           e.preventDefault()
//                                         }}
//                                         onCheckedChange={(checked) => {
//                                           if (checked) {
//                                             setEndMarketFilters((prev) => [...prev, market])
//                                           } else {
//                                             setEndMarketFilters((prev) => prev.filter((m) => m !== market))
//                                           }
//                                         }}
//                                       >
//                                         {market}
//                                       </DropdownMenuCheckboxItem>
//                                     ))}
//                                 </div>
//                                 {endMarketFilters.length > 0 && (
//                                   <>
//                                     <DropdownMenuSeparator />
//                                     <DropdownMenuItem
//                                       onSelect={(e) => {
//                                         e.preventDefault()
//                                         setEndMarketFilters([])
//                                       }}
//                                     >
//                                       Clear All Filters
//                                     </DropdownMenuItem>
//                                   </>
//                                 )}
//                               </DropdownMenuContent>
//                             </DropdownMenu>

//                             {/* Add Stage Distribution Pills */}
//                             {selectedVC &&
//                               (() => {
//                                 const vcData = vcs.find((v) => v.name === selectedVC)
//                                 return vcData?.stageDistribution ? (
//                                   <StageDistributionPills stageDistribution={vcData.stageDistribution} />
//                                 ) : null
//                               })()}
//                           </div>
//                         </div>
//                       </div>
//                       <FastVCPortfolio
//                         vcName={selectedVC}
//                         onStartupSelect={handleStartupSelect}
//                         lastRoundFilter={lastRoundFilter}
//                         statusFilter={statusFilter}
//                         endMarketFilters={endMarketFilters}
//                         onSaveChange={async (startupName, saved) => {
//                           try {
//                             const endpoint = `/api/startups/${saved ? "save" : "unsave"}`
//                             const response = await fetch(endpoint, {
//                               method: "POST",
//                               headers: { "Content-Type": "application/json" },
//                               body: JSON.stringify({ id: startupName }),
//                             })

//                             if (response.ok) {
//                               if (saved) {
//                                 setSavedStartups((prev) => [...prev, startupName])
//                               } else {
//                                 setSavedStartups((prev) => prev.filter((name) => name !== startupName))
//                               }
//                             }
//                           } catch (error) {
//                             console.error("Failed to update saved status:", error)
//                           }
//                         }}
//                       />
//                       <NonQualifiedStartupList
//                         vcId={`vc-${selectedVC.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
//                         nonQualifiedStartups={nonQualifiedStartups}
//                       />
//                     </motion.div>
//                   )}

//                   {selectedStartup && (
//                     <motion.div
//                       key="startupDetails"
//                       initial={{ opacity: 0 }}
//                       animate={{ opacity: 1 }}
//                       exit={{ opacity: 0 }}
//                       transition={{ duration: 0.15 }}
//                     >
                      
//                       <StartupDetails
//                         startup={selectedStartup}
//                         onBack={(vcName) => {
//                           if (selectedVC) {
//                             // Coming from a specific VC portfolio
//                             updateURL({
//                               vc: selectedVC,
//                               startup: null,
//                               saved: viewingSaved,
//                               filterType: filterType,
//                               location: locationFilter,
//                               entityType: null,
//                             })
//                           } else if (localEntityType === "startup") {
//                             // Coming from "View Startups" mode
//                             updateURL({
//                               startup: null,
//                               vc: null,
//                               saved: viewingSaved,
//                               filterType: filterType,
//                               location: locationFilter,
//                               entityType: "startup",
//                             })
//                           } else if (isFromSearch) {
//                             // Coming from search - return to appropriate home view
//                             if (localEntityType) {
//                               updateURL({
//                                 startup: null,
//                                 vc: null,
//                                 saved: null,
//                                 filterType: filterType,
//                                 location: locationFilter,
//                                 entityType: localEntityType,
//                               })
//                             } else {
//                               resetToHome()
//                             }
//                             // ✅ Reset the search flag here in the parent component
//                             setIsFromSearch(false)
//                           } else if (vcName) {
//                             // Coming from a VC portfolio (fallback)
//                             updateURL({
//                               vc: vcName,
//                               startup: null,
//                               saved: viewingSaved,
//                               filterType: filterType,
//                               location: locationFilter,
//                               entityType: null,
//                             })
//                           } else if (viewingSaved) {
//                             // Coming from saved items
//                             updateURL({
//                               saved: viewingSaved,
//                               startup: null,
//                               vc: null,
//                               filterType: null,
//                               location: null,
//                               entityType: null,
//                             })
//                           } else {
//                             resetToHome()
//                           }
//                         }}
//                       />
//                     </motion.div>
//                   )}

//                   {viewingSaved === "vcs" && !selectedVC && (
//                     <motion.div
//                       key="savedVCs"
//                       initial={{ opacity: 0 }}
//                       animate={{ opacity: 1 }}
//                       exit={{ opacity: 0 }}
//                       transition={{ duration: 0.15 }}
//                     >
//                       {shouldShowSkeleton ? (
//                         <VCGridSkeleton count={12} />
//                       ) : (
//                         <GridView
//                           type="vc"
//                           filter={{ type: null, value: null }}
//                           onItemSelect={handleVCSelect}
//                           savedItems={savedVCs}
//                           onSaveChange={handleSaveChange}
//                           savedOnly={true}
//                           onTotalItemsChange={setVcCount}
//                         />
//                       )}
//                     </motion.div>
//                   )}

//                   {viewingSaved === "startups" && !selectedStartup && (
//                     <motion.div
//                       key="savedStartups"
//                       initial={{ opacity: 0 }}
//                       animate={{ opacity: 1 }}
//                       exit={{ opacity: 0 }}
//                       transition={{ duration: 0.15 }}
//                     >
//                       <div className="mb-8 mt-12">
//                         <h2 className="text-2xl font-bold text-white">
//                           Saved Startups
//                           <span className="ml-2 text-base font-normal text-white/60">
//                             {savedStartupsCount} Startups
//                           </span>
//                         </h2>
//                       </div>
//                       {shouldShowSkeleton ? (
//                         <StartupGridSkeleton count={12} />
//                       ) : (
//                         <GridView
//                           type="startup"
//                           filter={memoizedFilter}
//                           onItemSelect={handleStartupSelect}
//                           savedItems={savedStartups}
//                           savedOnly={true}
//                           lastRoundFilter={lastRoundFilter}
//                           statusFilter={statusFilter}
//                           endMarketFilters={endMarketFilters}
//                           isPortfolio={true}
//                           externalData={filteredStartups}
//                           onSaveChange={async (startupName, saved) => {
//                             try {
//                               const endpoint = `/api/startups/${saved ? "save" : "unsave"}`
//                               const response = await fetch(endpoint, {
//                                 method: "POST",
//                                 headers: { "Content-Type": "application/json" },
//                                 body: JSON.stringify({ id: startupName }),
//                               })

//                               if (response.ok) {
//                                 if (saved) {
//                                   setSavedStartups((prev) => [...prev, startupName])
//                                 } else {
//                                   setSavedStartups((prev) => prev.filter((name) => name !== startupName))
//                                 }
//                               }
//                             } catch (error) {
//                               console.error("Failed to update saved status:", error)
//                             }
//                           }}
//                         />
//                       )}
//                       {!shouldShowSkeleton && <SavedNonQualifiedStartupsSection userId={session?.user?.id || ""} />}
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               )}
//             </>
//           </>
//         ) : (
//           <div className="flex flex-grow items-center justify-center">
//             <p className="text-gray-800 text-xl">Please sign in to access the VC Dashboard</p>
//           </div>
//         )}

//         <PreferencesDialog
//           open={preferencesOpen}
//           onOpenChange={setPreferencesOpen}
//           currentTheme={theme}
//           onThemeChange={setTheme}
//         />

//         {selectedVC && (
//           <Dialog open={isNoteOpen} onOpenChange={setIsNoteOpen}>
//             <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col bg-[#0f172a] border-white/10 text-white">
//               <DialogHeader>
//                 <DialogTitle className="text-white">{selectedVC} - Notes</DialogTitle>
//               </DialogHeader>
//               <div className="flex-1 overflow-hidden">
//                 <AffinityNotes domain={vcs.find((v) => v.name === selectedVC)?.website || ""} name={selectedVC} />
//               </div>
//             </DialogContent>
//           </Dialog>
//         )}
//     </div>
//   )
// }
