import React from 'react'
import { motion } from "framer-motion"
import { StartupList } from "@/components/startup-list"
import { StartupGridSkeleton } from "@/components/skeleton-components"

interface StartupSectionProps {
  vc: string | null
  onStartupSelect: (startup: string, fromSearch?: boolean) => void
  onBack: () => void
  filter: {
    type: "state" | "city" | null
    value: string | null
  }
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

export const StartupSection: React.FC<StartupSectionProps> = ({
  vc,
  onStartupSelect,
  onBack,
  filter,
  lastRoundFilter,
  statusFilter,
  endMarketFilters,
  isPortfolio,
  startups,
  page,
  onPageChange,
  onSaveChange,
  shouldShowSkeleton,
  savedOnly = false,
}) => {
  if (shouldShowSkeleton) {
    return <StartupGridSkeleton count={12} />
  }

  return (
    <motion.div
      key="startup-section"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      <StartupList
        vc={vc}
        onStartupSelect={onStartupSelect}
        onBack={onBack}
        filter={filter}
        lastRoundFilter={lastRoundFilter}
        statusFilter={statusFilter}
        endMarketFilters={endMarketFilters}
        isPortfolio={isPortfolio}
        startups={startups}
        page={page}
        onPageChange={onPageChange}
        onSaveChange={onSaveChange}
        savedOnly={savedOnly}
      />
    </motion.div>
  )
}
