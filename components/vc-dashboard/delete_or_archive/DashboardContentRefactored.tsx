// "use client"

// import React, { useState, useEffect, useCallback, useMemo } from "react"
// import { useSession, signIn, signOut } from "next-auth/react"
// import { useCustomAuth } from "@/hooks/use-custom-auth"
// import { useTheme } from "@/components/theme-provider"
// import { useData } from "@/context/data-context"
// import { motion, AnimatePresence } from "framer-motion"

// // Custom hooks
// import { useSavedItems } from "@/hooks/use-saved-items"
// import { useURLState } from "@/hooks/use-url-state"
// import { useDashboardFilters } from "@/hooks/use-dashboard-filters"

// // Components
// import { HeaderSection } from "./core/HeaderSection"
// import { FilterComponent } from "./core/FilterTab"
// import { LoadingIndicator, ErrorDisplay } from "./shared/LoadingStates"
// import { LocationFilterModal } from "@/components/location-filter-modal"
// import { FilterStartupsModal } from "@/components/filter-startups-modal"
// import { PreferencesDialog } from "@/components/preferences-dialog"
// import { TooltipProvider } from "@/components/ui/tooltip"

// // Services
// import { SavedItemsService } from "@/services/saved-items-service"

// // Utils
// import { filterVCs, filterStartups, applyAdvancedStartupFilters } from "@/utils/filter-utils"

// interface DashboardContentRefactoredProps {
//   // Add any props if needed
// }

// export default function DashboardContentRefactored({}: DashboardContentRefactoredProps) {
//   const { theme, themeGradient, setTheme } = useTheme()
//   const { data: session, status } = useSession()
//   const customAuth = useCustomAuth()
  
//   // Authentication state
//   const isAuthenticated = true // TEMPORARY: Hardcode for testing
//   const currentSession = customAuth.status === 'authenticated' ? customAuth : {
//     user: { email: 'test@example.com', name: 'Test User' },
//     status: 'authenticated'
//   }

//   // URL state management
//   const { 
//     selectedVC, 
//     selectedStartup, 
//     filterType, 
//     locationFilter, 
//     viewingSaved, 
//     entityType, 
//     page, 
//     updateURL, 
//     router 
//   } = useURLState()

//   // Data loading
//   const shouldLoadFullData = selectedVC || selectedStartup || viewingSaved === "startups" || entityType === "startup"
//   const {
//     startups,
//     nonQualifiedStartups,
//     giveawayData,
//     locations,
//     isLoading: isLoadingData,
//     hasInitialData,
//     error: dataError,
//     refetch,
//     vcs,
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

//   // Saved items management
//   const {
//     savedVCs,
//     savedStartups,
//     setSavedVCs,
//     setSavedStartups,
//     fetchSavedVCs,
//     fetchSavedStartups,
//     isLoading: isSavedItemsLoading,
//   } = useSavedItems(isAuthenticated ? 'authenticated' : 'unauthenticated')

//   // Local state
//   const [localEntityType, setLocalEntityType] = useState<"vc" | "startup" | null>(entityType)
//   const [preferencesOpen, setPreferencesOpen] = useState(false)
//   const [localError, setLocalError] = useState<string | null>(null)
//   const [locationFilterOpen, setLocationFilterOpen] = useState(false)
//   const [filterStartupsModalOpen, setFilterStartupsModalOpen] = useState(false)
//   const [isViewTransitioning, setIsViewTransitioning] = useState(false)
//   const [currentPage, setCurrentPage] = useState(1)
//   const [isDataLoading, setIsDataLoading] = useState(false)
//   const [vcCount, setVcCount] = useState(0)
//   const [isFromSearch, setIsFromSearch] = useState(false)

//   // Filter management
//   const {
//     filteredVCs,
//     filteredStartups,
//     fullyFilteredStartupsCount,
//     savedStartupsCount,
//     lastRoundFilter,
//     statusFilter,
//     endMarketFilters,
//     setLastRoundFilter,
//     setStatusFilter,
//     setEndMarketFilters,
//     getUniqueLastRounds,
//     getUniqueStatuses,
//     getUniqueEndMarkets,
//     clearFilters,
//   } = useDashboardFilters({
//     startups,
//     vcs,
//     filterType,
//     locationFilter,
//     selectedVC,
//     localEntityType,
//   })

//   // Memoized filter object
//   const memoizedFilter = useMemo(
//     () => ({
//       type: filterType,
//       value: locationFilter,
//     }),
//     [filterType, locationFilter],
//   )

//   // Effects
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

//   // Event handlers
//   const handleSaveChange = useCallback(
//     async (vcId: string, saved: boolean) => {
//       if (!vcId) return

//       const serviceMethod = saved ? SavedItemsService.saveVC : SavedItemsService.unsaveVC
//       const result = await serviceMethod(vcId)
      
//       if (result.success) {
//         if (saved) {
//           setSavedVCs((prev) => [...prev, vcId])
//         } else {
//           setSavedVCs((prev) => prev.filter((id) => id !== vcId))
//         }
//         if (viewingSaved === "vcs") {
//           await fetchSavedVCs()
//         }
//       } else {
//         setLocalError(result.message || "Failed to update saved status")
//       }
//     },
//     [fetchSavedVCs, setSavedVCs, viewingSaved],
//   )

//   const handleVCSelect = useCallback(
//     (vc: string) => {
//       if (!vc) return
//       setIsDataLoading(true)
//       window.scrollTo({ top: 0, behavior: "smooth" })
//       router.push(`/?vc=${encodeURIComponent(vc)}`)
//     },
//     [router],
//   )

//   const handleStartupSelect = useCallback(
//     (startup: string, fromSearch = false) => {
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
//     [updateURL, selectedVC, viewingSaved, filterType, locationFilter, localEntityType],
//   )

//   const clearFilter = useCallback(() => {
//     const currentEntityType = entityType || "vc"
//     clearFilters()
//     setCurrentPage(1)

//     const url = new URL(window.location.href)
//     url.searchParams.delete("filterType")
//     url.searchParams.delete("location")
//     url.searchParams.set("page", "1")

//     if (currentEntityType) {
//       url.searchParams.set("entityType", currentEntityType)
//     }
//     if (viewingSaved) {
//       url.searchParams.set("saved", viewingSaved)
//     }

//     window.history.pushState({}, "", url.toString())
//     router.refresh()
//   }, [entityType, viewingSaved, router, clearFilters])

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

//   const viewSavedItems = useCallback(
//     (type: "vcs" | "startups") => {
//       updateURL({
//         saved: type,
//         vc: null,
//         startup: null,
//         filterType: null,
//         location: null,
//         entityType: null,
//       })
//     },
//     [updateURL],
//   )

//   const handleRetry = useCallback(() => {
//     setLocalError(null)
//     refetch()
//   }, [refetch])

//   const handleEntityTypeChange = useCallback(
//     (value: string) => {
//       if (value === "location") {
//         setLocationFilterOpen(true)
//         return
//       }

//       if (value === "vc" || value === "startup") {
//         setIsViewTransitioning(true)
//         setLocalEntityType(value as "vc" | "startup")
//         setCurrentPage(1)

//         updateURL({
//           entityType: value,
//           filterType: filterType,
//           location: locationFilter,
//           saved: null,
//           vc: null,
//           startup: null,
//           page: "1",
//         })
//       }
//     },
//     [updateURL, filterType, locationFilter],
//   )

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

//       const params = {
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

//   // Combine all errors
//   const displayError = localError || (dataError ? String(dataError) : null)
//   const shouldShowSkeleton = (isLoadingData && !hasInitialData) || isDataLoading

//   return (
//     <TooltipProvider>
//       <div className={`flex min-h-screen flex-col p-3 sm:p-6 lg:p-8 bg-gradient-to-br ${themeGradient}`}>
//         <HeaderSection
//           status={isAuthenticated ? 'authenticated' : 'unauthenticated'}
//           session={currentSession}
//           onSignIn={() => signIn("auth0")}
//           onSignOut={() => signOut()}
//           onPreferencesOpen={() => setPreferencesOpen(true)}
//           onViewSavedItems={viewSavedItems}
//           onVCSelect={handleVCSelect}
//           onStartupSelect={handleStartupSelect}
//           onLocationFilterOpen={() => setLocationFilterOpen(true)}
//         />

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
//                 status: statusFilter,
//                 endMarkets: endMarketFilters,
//               }}
//               onApplyFilters={({ locationType, locations, lastRound, status, endMarkets }) => {
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
//                 setStatusFilter(status)
//                 setEndMarketFilters(endMarkets)

//                 window.history.pushState({}, "", url.toString())
//                 router.refresh()
//               }}
//             />

//             {displayError && !shouldShowSkeleton && <ErrorDisplay error={displayError} onRetry={handleRetry} />}

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
//                   {/* Main content rendering logic would go here */}
//                   {/* This is a simplified version - the full implementation would include all the view logic */}
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
//       </div>
//     </TooltipProvider>
//   )
// }
