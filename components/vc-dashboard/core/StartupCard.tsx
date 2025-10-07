"use client"

import React, { memo, useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, ExternalLink, Award, DollarSign, Rocket, AlertCircle, Compass, Radar, Globe } from "lucide-react"
import { CompanyLogo } from "@/components/vc-dashboard/core/OrgIcon"
import { SaveButton } from "@/components/SaveButton"
import { EnhancedTooltip } from "@/components/enhanced-tooltip"
import type { StartupData } from "@/lib/data-utils"
import { getStatusTailwindColor } from "@/utils/startup-utils"

// LinkedIn Icon Component
const LinkedInIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)

// Constants
const ANIMATION_DELAY_MULTIPLIER = 0.03
const MAX_ANIMATION_DELAY = 0.15
const LOGO_SIZES = {
  list: 40,
  grid: 40,
} as const

// Last funding stage labels
export const LAST_FUNDING_LABELS: Record<string, string> = {
  SERIES_UNKNOWN: "Series Unknown",
  UNKNOWN: "Unknown",
  SEED: "Seed",
  SERIES_A: "Series A",
  SERIES_B: "Series B",
  SERIES_C: "Series C",
  SERIES_D: "Series D",
  PRE_SEED: "Pre-Seed",
}

// Currency formatter (short): 1200 -> $1.2K, 1250000 -> $1.25M
function formatCurrencyShort(value?: number): string | null {
  if (value == null || isNaN(value)) return null
  const abs = Math.abs(value)
  if (abs >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2).replace(/\.00$/, "")}B`
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(2).replace(/\.00$/, "")}M`
  if (abs >= 1_000) return `$${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`
  return `$${Math.round(value).toLocaleString("en-US")}`
}

// Company score formatter: 12.34 -> 12, 12.56 -> 13
function formatCompanyScore(score?: number): string | null {
  console.log("Score: ", score)
  if (score == null || isNaN(score)) return null
  // Round to nearest integer
  score = Math.round(score)
  return score.toString()
}

interface StartupCardProps {
  startupData: StartupData
  layout: "list" | "grid"
  index?: number
  isSaved: boolean
  onNoteClick?: (startupName: string, website: string) => void
  onSaveChange?: (startupId: string, saved: boolean) => void
  animate?: boolean
  className?: string
}

export const StartupCard = memo(function StartupCard({
  startupData,
  layout = "list",
  index = 0,
  isSaved = false,
  onNoteClick,
  onSaveChange,
  animate = false,
  className = "",
}: StartupCardProps) {
  const router = useRouter()
  
  // Extract startup attributes for cleaner code
  const {
    id,
    name,
    website,
    linkedin,
    city,
    state,
    description,
    lastRound,
    companyScore,
    companyStatus,
    endMarket,
    totalRaised,
    inAffinity,
  } = startupData || {}


  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [localIsSaved, setLocalIsSaved] = useState(isSaved)

  // Update local state when prop changes
  useEffect(() => {
    setLocalIsSaved(isSaved)
  }, [isSaved])

  // Event handlers
  const handleSaveChange = useCallback(
    (saved: boolean) => {
      setLocalIsSaved(saved)
      onSaveChange?.(id, saved)
    },
    [id, onSaveChange]
  )

  const handleNoteClick = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation()
      onNoteClick?.(name, website || "")
    },
    [name, website, onNoteClick]
  )

  const handleCardClick = () => {
    if (inAffinity) {
      router.push(`/startups/${id}`)
    }
    // If inAffinity is false, do nothing
  }

  // Card styling based on layout and saved state
  const getCardStyling = () => {
    const baseStyles = [
      "overflow-hidden transition-all duration-200 h-full relative hover:bg-muted",
      localIsSaved ? "bg-blue-100 border-blue-400 shadow-md shadow-blue-300/30" : "",
      className
    ].filter(Boolean).join(" ")

    const layoutStyles = {
      list: "hover:translate-y-[-6px] hover:scale-[1.03] hover:shadow-2xl hover:shadow-blue-900/20 hover:z-10",
      grid: "hover:shadow-lg"
    }

    return `${baseStyles} ${layoutStyles[layout] || layoutStyles.list}`
  }

  // Company info component: Logo, Name, Location, and Website 
  const renderCompanyInfo = (logoSize: number = 40, showDescription: boolean = true) => (
    <div className="flex items-start gap-3 sm:gap-4 w-full overflow-hidden">
      {/* Company Logo */}
      <div className="flex-shrink-0">
        <CompanyLogo
          domain={website}
          name={name}
          size={logoSize}
          type="startup"
          className="flex-shrink-0"
          priority={index < 10 ? 10 - index : 0} // Higher priority for first 10 items
          onLoad={() => setIsImageLoaded(true)}
        />
      </div>

      {/* Company Name, Location, */}
      <div className="flex-1 min-w-0 overflow-hidden">

        <div className="flex items-baseline gap-1 mb-2">
          <h3 className="text-base sm:text-lg font-semibold line-clamp-2 mr-0.5">{name}</h3>
          <EnhancedTooltip title={name + (endMarket ? " (" + endMarket + ")" : "")} description={showDescription ? (description || "") : ""}>
            {/* decrease icon size */}
            <span className="sr-only">Info</span>
          </EnhancedTooltip>
        </div>
      
        {/* Location and Status Row */}
        {(city || state || companyStatus) && (
          <div className="flex items-center justify-between mb-3">
            {/* City and State */}
            {(city || state) && (
              <p className="text-sm text-muted-foreground line-clamp-1">
                {city ? city : ""}{city && state ? "," : ""} {state ? state : ""}
              </p>
            )}
            
            {/* Company Status Pill */}
            {companyStatus && (
              <span className={`inline-flex items-center gap-1 rounded-md bg-${getStatusTailwindColor(companyStatus)}-50 text-${getStatusTailwindColor(companyStatus)}-700 border border-${getStatusTailwindColor(companyStatus)}-200 px-2 h-6 text-xs font-sm cursor-default flex-shrink-0 ml-2 mt-1`}>
                {companyStatus}
              </span>
            )}

            {/* NotIn Affinity  Status Pill - COMMENTED OUT */} 
            {/* {!inAffinity && (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200 px-2 h-6 text-xs font-sm cursor-default flex-shrink-0 ml-2 mt-1">
                <Compass className="h-3 w-3 text-amber-500" />  
                NQ
              </span>
            )} */}
          </div>
        )}

        {/* Website and LinkedIn Icons Row */}
        <div className="flex items-center gap-2 mb-3.5">
          {/* Company Website - Globe Icon */}
          {website && (
            <a
              href={website.startsWith("http") ? website : `https://${website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-black hover:text-blue-600 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Globe className="h-4 w-4" />
            </a>
          )}

          {/* LinkedIn Icon */}
          {linkedin && (
            <a
              href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-black hover:text-blue-600 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <LinkedInIcon className="h-4 w-4" />
            </a>
          )}

          <div className="flex-1"></div>
          
          {/* Company Score */}
          {companyScore !== null && companyScore !== undefined && (
            companyScore > 0 ? (
              <>
              <span className="inline-flex items-center gap-1 rounded-md bg-green-50 text-green-700 border border-green-200 px-2 h-7 text-xs font-sm cursor-default ml-2 flex-shrink-0">
                <Award className="h-3 w-3 text-green-500" />
                Score: {formatCompanyScore(companyScore)}
              </span>
              </>
            ) : (
              <>
              <span className="inline-flex items-center gap-1 rounded-md bg-red-50 text-red-700 border border-red-200 px-2 h-7 text-xs font-sm cursor-default ml-2 flex-shrink-0">
                <Award className="h-3 w-3 text-red-500" />
                Score: {formatCompanyScore(companyScore)}
              </span>
              </>
            )
          )}
        </div>

        {/* Funding Info: Last Round & Total Raised */}
        {(lastRound || totalRaised != null) && (
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {lastRound && (
              <span className="inline-flex items-center gap-1">
                <Rocket className="h-3 w-3 text-gray-500" />
                {LAST_FUNDING_LABELS[lastRound] || lastRound}
              </span>
            )}

            {lastRound && totalRaised != null && (
              <span className="mx-1 text-xs opacity-60">•</span>
            )}

            {totalRaised != null && (
              <span className="inline-flex items-center gap-1">
                {/* <DollarSign className="h-3 w-3 text-gray-500" /> */}
                {formatCurrencyShort(totalRaised)}
              </span>
            )}
          </div>
        )}

      </div>
    </div>
  )

  // Action buttons component
  const renderActionButtons = (className: string = "") => (
    <div className={`absolute bottom-1 right-1 ${className}`}>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleNoteClick}
        className="text-gray-500 hover:text-gray-700 h-8 w-8"
      >
        <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
      </Button>
      <SaveButton
        itemId={id}
        itemType="startup"
        initialSaved={localIsSaved}
        onSaveChange={handleSaveChange}
        className={`h-8 w-8 ${localIsSaved ? "text-blue-500" : "text-gray-500 hover:text-gray-700"}`}
      />
    </div>
  )

  // Content layout based on variant
  const renderContent = () => {
    const logoSize = LOGO_SIZES[layout]
    const isGrid = layout == "grid"
    const showDescription = isGrid
  
    return (
      <CardContent
        className={isGrid ? "p-4 h-full flex flex-col" : "pl-0 pr-2 h-full overflow-hidden relative"}
      >
        <Button
          variant="ghost"
          onClick={handleCardClick}
          className={
            `h-full w-full justify-start text-left flex flex-col overflow-hidden hover:bg-transparent ` +
            (isGrid ? "p-2 pr-0 pl-0" : "pr-2 sm:p-6 sm:pr-0")
          }
        >
          <div className="flex flex-col w-full overflow-hidden">
            {renderCompanyInfo(logoSize, showDescription)}
          </div>
        </Button>

        {/* Action Buttons - Bottom Right  */}
        <div className={isGrid ? "" : "mt-2 self-end"}>
          {inAffinity && renderActionButtons()}
        </div>

        {/* Amber diagonal notch for startups not in affinity */}
        {!inAffinity && (
          <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-orange-500/80 backdrop-blur-lg"></div>
        )}
      </CardContent>
    )
  }  

  // Finally, return the card with the content
  if (animate) {  // If animation is enabled, wrap the card in a motion.div
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.2, 
          delay: Math.min(ANIMATION_DELAY_MULTIPLIER * index, MAX_ANIMATION_DELAY) 
        }}
        className="h-full"
        layout
      >
        <Card className={getCardStyling()}>{renderContent()}</Card>
      </motion.div>
    )
  }

  return <Card className={getCardStyling()}>{renderContent()}</Card>
})


