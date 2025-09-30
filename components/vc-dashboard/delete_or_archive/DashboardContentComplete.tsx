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

// // Section components
// import { HeaderSection } from "../core/HeaderSection"
// import { FilterTab } from "../core/FilterTab"
// import { VCSection } from "../core/VCSection"
// import { StartupSection } from "../core/StartupSection"
// import { VCPortfolioSection } from "../core/VCPortfolioSection"
// import { StartupDetailsSection } from "../core/StartupDetailsSection"
// import { SavedItemsSection } from "../core/SavedItemsSection"

// // Shared components
// import { LoadingIndicator, ErrorDisplay } from "./shared/LoadingStates"
// import { NotesModal } from "./modals/NotesModal"

// // External components
// import { LocationFilterModal } from "@/components/location-filter-modal"
// import { FilterStartupsModal } from "@/components/filter-startups-modal"
// import { PreferencesDialog } from "@/components/preferences-dialog"
// import { TooltipProvider } from "@/components/ui/tooltip"

// // Services
// import { SavedItemsService } from "@/services/saved-items-service"

// // Types
// import { 
//   DashboardProps, 
//   FilterState, 
//   URLParams,
//   UseSavedItemsReturn,
//   UseURLStateReturn,
//   UseDashboardFiltersReturn
// } from "@/types/dashboard"

// export default function DashboardContentComplete({}: DashboardProps) {
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
//   const urlState: UseURLStateReturn = useURLState()
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
//   } = urlState

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
//   const savedItems: UseSavedItemsReturn = useSavedItems(isAuthenticated ? 'authenticated' : 'unauthenticated')
//   const {
//     savedVCs,
//     savedStartups,
//     setSavedVCs,
//     setSavedStartups,
//     fetchSavedVCs,
//     fetchSavedStartups,
//     isLoading: isSavedItemsLoading,
//   } = savedItems

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
//   const [isNoteOpen, setIsNoteOpen] = useState(false)

//   // Filter management
//   const filters: UseDashboardFiltersReturn = useDashboardFilters({
//     startups,
//     vcs,
//     filterType,
//     locationFilter,
//     selectedVC,
//     localEntityType,
//   })
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
//   } = filters

//   // Memoized filter object
//   const memoizedFilter: FilterState = useMemo(
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

//   const handleStartupSaveChange = useCallback(
//     async (startupName: string, saved: boolean) => {
//       const serviceMethod = saved ? SavedItemsService.saveStartup : SavedItemsService.unsaveStartup
//       const result = await serviceMethod(startupName)
      
//       if (result.success) {
//         if (saved) {
//           setSavedStartups((prev) => [...prev, startupName])
//         } else {
//           setSavedStartups((prev) => prev.filter((name) => name !== startupName))
//         }
//       } else {
//         setLocalError(result.message || "Failed to update saved status")
//       }
//     },
//     [setSavedStartups],
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
//                   {/* Main VC List View */}
//                   {!selectedVC && !selectedStartup && !viewingSaved && localEntityType !== "startup" && (
//                     <VCSection
//                       filter={memoizedFilter}
//                       onVCSelect={handleVCSelect}
//                       savedVCs={savedVCs}
//                       onSaveChange={handleSaveChange}
//                       onTotalItemsChange={setVcCount}
//                       shouldShowSkeleton={shouldShowSkeleton}
//                     />
//                   )}

//                   {/* Main Startup List View */}
//                   {!selectedVC && !selectedStartup && !viewingSaved && localEntityType === "startup" && (
//                     <StartupSection
//                       vc={null}
//                       onStartupSelect={handleStartupSelect}
//                       onBack={resetToHome}
//                       filter={memoizedFilter}
//                       lastRoundFilter={lastRoundFilter}
//                       statusFilter={statusFilter}
//                       endMarketFilters={endMarketFilters}
//                       isPortfolio={true}
//                       startups={filteredStartups}
//                       page={currentPage}
//                       onPageChange={setCurrentPage}
//                       onSaveChange={handleStartupSaveChange}
//                       shouldShowSkeleton={shouldShowSkeleton}
//                     />
//                   )}

//                   {/* VC Portfolio View */}
//                   {selectedVC && !selectedStartup && (
//                     <VCPortfolioSection
//                       selectedVC={selectedVC}
//                       vcs={vcs}
//                       startups={startups}
//                       nonQualifiedStartups={nonQualifiedStartups}
//                       giveawayData={giveawayData}
//                       savedVCs={savedVCs}
//                       lastRoundFilter={lastRoundFilter}
//                       statusFilter={statusFilter}
//                       endMarketFilters={endMarketFilters}
//                       onBack={resetToHome}
//                       onStartupSelect={handleStartupSelect}
//                       onSaveChange={handleSaveChange}
//                       onStartupSaveChange={handleStartupSaveChange}
//                       onNoteOpen={() => setIsNoteOpen(true)}
//                       onLastRoundFilterChange={setLastRoundFilter}
//                       onStatusFilterChange={setStatusFilter}
//                       onEndMarketFiltersChange={setEndMarketFilters}
//                       getUniqueLastRounds={getUniqueLastRounds}
//                       getUniqueStatuses={getUniqueStatuses}
//                       getUniqueEndMarkets={getUniqueEndMarkets}
//                     />
//                   )}

//                   {/* Startup Details View */}
//                   {selectedStartup && (
//                     <StartupDetailsSection
//                       selectedStartup={selectedStartup}
//                       selectedVC={selectedVC}
//                       localEntityType={localEntityType}
//                       viewingSaved={viewingSaved}
//                       filterType={filterType}
//                       locationFilter={locationFilter}
//                       isFromSearch={isFromSearch}
//                       onBack={(vcName) => {
//                         if (selectedVC) {
//                           updateURL({
//                             vc: selectedVC,
//                             startup: null,
//                             saved: viewingSaved,
//                             filterType: filterType,
//                             location: locationFilter,
//                             entityType: null,
//                           })
//                         } else if (localEntityType === "startup") {
//                           updateURL({
//                             startup: null,
//                             vc: null,
//                             saved: viewingSaved,
//                             filterType: filterType,
//                             location: locationFilter,
//                             entityType: "startup",
//                           })
//                         } else if (isFromSearch) {
//                           if (localEntityType) {
//                             updateURL({
//                               startup: null,
//                               vc: null,
//                               saved: null,
//                               filterType: filterType,
//                               location: locationFilter,
//                               entityType: localEntityType,
//                             })
//                           } else {
//                             resetToHome()
//                           }
//                           setIsFromSearch(false)
//                         } else if (vcName) {
//                           updateURL({
//                             vc: vcName,
//                             startup: null,
//                             saved: viewingSaved,
//                             filterType: filterType,
//                             location: locationFilter,
//                             entityType: null,
//                           })
//                         } else if (viewingSaved) {
//                           updateURL({
//                             saved: viewingSaved,
//                             startup: null,
//                             vc: null,
//                             filterType: null,
//                             location: null,
//                             entityType: null,
//                           })
//                         } else {
//                           resetToHome()
//                         }
//                       }}
//                       onResetToHome={resetToHome}
//                       onUpdateURL={updateURL}
//                       onSetIsFromSearch={setIsFromSearch}
//                     />
//                   )}

//                   {/* Saved VCs View */}
//                   {viewingSaved === "vcs" && !selectedVC && (
//                     <SavedItemsSection
//                       type="vcs"
//                       filter={{ type: null, value: null }}
//                       onVCSelect={handleVCSelect}
//                       onStartupSelect={handleStartupSelect}
//                       onBack={resetToHome}
//                       savedVCs={savedVCs}
//                       onSaveChange={handleSaveChange}
//                       onStartupSaveChange={handleStartupSaveChange}
//                       onTotalItemsChange={setVcCount}
//                       shouldShowSkeleton={shouldShowSkeleton}
//                       savedStartupsCount={0}
//                       filteredStartups={[]}
//                       lastRoundFilter={null}
//                       statusFilter={null}
//                       endMarketFilters={[]}
//                     />
//                   )}

//                   {/* Saved Startups View */}
//                   {viewingSaved === "startups" && !selectedStartup && (
//                     <SavedItemsSection
//                       type="startups"
//                       filter={memoizedFilter}
//                       onVCSelect={handleVCSelect}
//                       onStartupSelect={handleStartupSelect}
//                       onBack={resetToHome}
//                       savedVCs={savedVCs}
//                       onSaveChange={handleSaveChange}
//                       onStartupSaveChange={handleStartupSaveChange}
//                       onTotalItemsChange={setVcCount}
//                       shouldShowSkeleton={shouldShowSkeleton}
//                       savedStartupsCount={savedStartupsCount}
//                       filteredStartups={filteredStartups}
//                       lastRoundFilter={lastRoundFilter}
//                       statusFilter={statusFilter}
//                       endMarketFilters={endMarketFilters}
//                       sessionUserId={session?.user?.id}
//                     />
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
//           <NotesModal
//             isOpen={isNoteOpen}
//             onOpenChange={setIsNoteOpen}
//             selectedVC={selectedVC}
//             vcWebsite={vcs.find((v) => v.name === selectedVC)?.website}
//           />
//         )}
//       </div>
//     </TooltipProvider>
//   )
// }
