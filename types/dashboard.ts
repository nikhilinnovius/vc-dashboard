// Dashboard-specific types

export interface FilterState {
  type: "state" | "city" | null
  value: string | null
}

export interface URLParams {
  vc?: string | null
  startup?: string | null
  entityType?: string | null
  filterType?: string | null
  location?: string | null
  saved?: string | null
  page?: string | null
}

export interface DashboardState {
  localEntityType: "vc" | "startup" | null
  preferencesOpen: boolean
  localError: string | null
  locationFilterOpen: boolean
  filterStartupsModalOpen: boolean
  isViewTransitioning: boolean
  currentPage: number
  isDataLoading: boolean
  vcCount: number
  isFromSearch: boolean
}

export interface FilterOptions {
  lastRoundFilter: string | null
  statusFilter: string | null
  endMarketFilters: string[]
}

export interface SavedItemsState {
  savedVCs: string[]
  savedStartups: string[]
  isLoading: boolean
}

export interface DashboardProps {
  // Add any props that the main dashboard component might need
}

export interface SectionProps {
  // Common props for all section components
  className?: string
}

export interface ModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export interface LoadingStateProps {
  entityType?: string
  showSkeleton?: boolean
  count?: number
}

export interface ErrorStateProps {
  error: string
  onRetry: () => void
  title?: string
  description?: string
}

// Component-specific prop interfaces
export interface HeaderSectionProps {
  status: string
  session: any
  onSignIn: () => void
  onSignOut: () => void
  onPreferencesOpen: () => void
  onViewSavedItems: (type: "vcs" | "startups") => void
  onVCSelect: (vc: string) => void
  onStartupSelect: (startup: string, fromSearch?: boolean) => void
  onLocationFilterOpen: () => void
  onResetToHome: () => void
}

export interface FilterSectionProps {
  filterType: string | null
  locationFilter: string | null
  localEntityType: "vc" | "startup" | null
  onClearFilter: () => void
  onUpdateURL: (params: URLParams) => void
  onFilterStartupsModalOpen: () => void
  fullyFilteredStartupsCount: number
  filteredStartupsLength: number
  filteredVCsCount: number
  viewingSaved: string | null
}

export interface VCSectionProps {
  filter: FilterState
  onVCSelect: (vc: string) => void
  savedVCs: string[]
  onSaveChange: (vcId: string, saved: boolean) => void
  onTotalItemsChange: (count: number) => void
  shouldShowSkeleton: boolean
  savedOnly?: boolean
}

export interface StartupSectionProps {
  vc: string | null
  onStartupSelect: (startup: string, fromSearch?: boolean) => void
  onBack: () => void
  filter: FilterState
  lastRoundFilter: string | null
  statusFilter: string | null
  endMarketFilters: string[]
  isPortfolio: boolean
  startups: any[]
  page: number
  onPageChange: (page: number) => void
  onSaveChange: (startupName: string, saved: boolean) => Promise<void>
  shouldShowSkeleton: boolean
  savedOnly?: boolean
}

export interface VCPortfolioSectionProps {
  selectedVC: string
  vcs: any[]
  startups: any[]
  nonQualifiedStartups: any[]
  giveawayData: any[]
  savedVCs: string[]
  lastRoundFilter: string | null
  statusFilter: string | null
  endMarketFilters: string[]
  onBack: () => void
  onStartupSelect: (startup: string, fromSearch?: boolean) => void
  onSaveChange: (vcId: string, saved: boolean) => void
  onStartupSaveChange: (startupName: string, saved: boolean) => Promise<void>
  onNoteOpen: () => void
  onLastRoundFilterChange: (filter: string | null) => void
  onStatusFilterChange: (filter: string | null) => void
  onEndMarketFiltersChange: (filters: string[]) => void
  getUniqueLastRounds: (vcId: string) => string[]
  getUniqueStatuses: (vcId: string) => string[]
  getUniqueEndMarkets: (vcId: string) => string[]
}

export interface StartupDetailsSectionProps {
  selectedStartup: string
  selectedVC?: string | null
  localEntityType?: "vc" | "startup" | null
  viewingSaved?: string | null
  filterType?: string | null
  locationFilter?: string | null
  isFromSearch?: boolean
  onBack: (vcName?: string) => void
  onResetToHome: () => void
  onUpdateURL: (params: URLParams) => void
  onSetIsFromSearch: (value: boolean) => void
}

export interface SavedItemsSectionProps {
  type: "vcs" | "startups"
  filter: FilterState
  onVCSelect: (vc: string) => void
  onStartupSelect: (startup: string, fromSearch?: boolean) => void
  onBack: () => void
  savedVCs: string[]
  onSaveChange: (vcId: string, saved: boolean) => void
  onStartupSaveChange: (startupName: string, saved: boolean) => Promise<void>
  onTotalItemsChange: (count: number) => void
  shouldShowSkeleton: boolean
  savedStartupsCount: number
  filteredStartups: any[]
  lastRoundFilter: string | null
  statusFilter: string | null
  endMarketFilters: string[]
  sessionUserId?: string
}

export interface NotesModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedVC: string
  vcWebsite?: string
}

// Hook return types
export interface UseSavedItemsReturn {
  savedVCs: string[]
  savedStartups: string[]
  setSavedVCs: React.Dispatch<React.SetStateAction<string[]>>
  setSavedStartups: React.Dispatch<React.SetStateAction<string[]>>
  fetchSavedVCs: () => Promise<void>
  fetchSavedStartups: () => Promise<void>
  isLoading: boolean
}

export interface UseURLStateReturn {
  selectedVC: string | null
  selectedStartup: string | null
  filterType: "state" | "city" | null
  locationFilter: string | null
  viewingSaved: "vcs" | "startups" | null
  entityType: "vc" | "startup" | null
  page: string | null
  updateURL: (params: URLParams) => void
  router: any
}

export interface UseDashboardFiltersReturn {
  filteredVCs: any[]
  filteredStartups: any[]
  fullyFilteredStartupsCount: number
  savedStartupsCount: number
  lastRoundFilter: string | null
  statusFilter: string | null
  endMarketFilters: string[]
  setLastRoundFilter: (filter: string | null) => void
  setStatusFilter: (filter: string | null) => void
  setEndMarketFilters: (filters: string[]) => void
  getUniqueLastRounds: (vcId: string) => string[]
  getUniqueStatuses: (vcId: string) => string[]
  getUniqueEndMarkets: (vcId: string) => string[]
  clearFilters: () => void
}
