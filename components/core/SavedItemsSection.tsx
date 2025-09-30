import React from 'react'
import { motion } from "framer-motion"
import { VCList } from "@/components/vc-list"
import { StartupList } from "@/components/startup-list"
import { VCGridSkeleton, StartupGridSkeleton } from "@/components/skeleton-components"
import { SavedNonQualifiedStartupsSection } from "./SavedNonQualifiedStartupsSection"

interface SavedItemsSectionProps {
  type: "vcs" | "startups"
  filter: {
    type: "state" | "city" | null
    value: string | null
  }
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

export const SavedItemsSection: React.FC<SavedItemsSectionProps> = ({
  type,
  filter,
  onVCSelect,
  onStartupSelect,
  onBack,
  savedVCs,
  onSaveChange,
  onStartupSaveChange,
  onTotalItemsChange,
  shouldShowSkeleton,
  savedStartupsCount,
  filteredStartups,
  lastRoundFilter,
  statusFilter,
  endMarketFilters,
  sessionUserId,
}) => {
  if (type === "vcs") {
    return (
      <motion.div
        key="saved-vcs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
      >
        {shouldShowSkeleton ? (
          <VCGridSkeleton count={12} />
        ) : (
          <VCList
            filter={filter}
            onVCSelect={onVCSelect}
            savedVCs={savedVCs}
            onSaveChange={onSaveChange}
            savedOnly={true}
            onTotalItemsChange={onTotalItemsChange}
          />
        )}
      </motion.div>
    )
  }

  return (
    <motion.div
      key="saved-startups"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      <div className="mb-8 mt-12">
        <h2 className="text-2xl font-bold text-white">
          Saved Startups
          <span className="ml-2 text-base font-normal text-white/60">
            {savedStartupsCount} Startups
          </span>
        </h2>
      </div>
      
      {shouldShowSkeleton ? (
        <StartupGridSkeleton count={12} />
      ) : (
        <>
          <StartupList
            vc={null}
            onStartupSelect={onStartupSelect}
            onBack={onBack}
            savedOnly={true}
            filter={filter}
            lastRoundFilter={lastRoundFilter}
            statusFilter={statusFilter}
            endMarketFilters={endMarketFilters}
            isPortfolio={true}
            startups={filteredStartups}
            onSaveChange={onStartupSaveChange}
          />
          {!shouldShowSkeleton && sessionUserId && (
            <SavedNonQualifiedStartupsSection userId={sessionUserId} />
          )}
        </>
      )}
    </motion.div>
  )
}
