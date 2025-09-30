"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, ExternalLink, Award } from "lucide-react"
import { CompanyLogo } from "@/components/vc-dashboard/core/OrgIcon"
import { memo, useState, useEffect, useCallback } from "react"
import { SaveButton } from "@/components/SaveButton"
import { EnhancedTooltip } from "@/components/enhanced-tooltip"
import type { VentureData } from "@/lib/data-utils"
import { redirect } from "next/navigation"

interface VCCardProps {
  vcData: VentureData
  layout?: "list" | "grid"
  index?: number
  isSaved?: boolean
  onClick?: () => void
  onNoteClick?: (vcName: string, website: string) => void
  onSaveChange?: (vcId: string, saved: boolean) => void
  animate?: boolean
  className?: string
}

export const VCCard = memo(function VCCard({
  vcData,
  layout = "list",
  index = 0,
  isSaved = false,
  onClick, 
  onNoteClick,
  onSaveChange,
  animate = false,
  className = "",
}: VCCardProps) {

  // Extract VC attributes for cleaner code
  const {
    id,
    name,
    website,
    city,
    state,
    description,
    vcScore,
    aum,
    stageDistribution: stage_distribution,
    numberOfPortfolioCompanies,
  } : VentureData = vcData || {}

  console.log('vc', vcData)


  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [localIsSaved, setLocalIsSaved] = useState(isSaved)

  // Update local state when prop changes
  useEffect(() => {
    setLocalIsSaved(isSaved)
  }, [isSaved])

  // Handle result coming back from <SaveButton />
  const handleSaveChange = useCallback(
    (saved: boolean) => {
      setLocalIsSaved(saved)           // Update local state for immediate UI feedback
      onSaveChange?.(id, saved)        // Call parent with (vcId, saved) signature
    },
    [id, onSaveChange]
  )

  const handleNoteClick = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation()
      onNoteClick?.(name, website || "")
    },
    [name, website, onNoteClick],
  )

  const handleCardClick = useCallback(() => {
    onClick?.()
  }, [onClick])

  // Determine card styling based on variant
  const getCardStyles = () => {
    const baseStyles = `overflow-hidden transition-all duration-200 h-full relative ${
      localIsSaved ? "bg-blue-100 border-blue-400 shadow-md shadow-blue-300/30" : ""
    } ${className}`

    switch (layout) {
      case "list":
        return `${baseStyles} hover:translate-y-[-6px] hover:scale-[1.03] hover:shadow-2xl hover:shadow-blue-900/20 hover:z-10`
      case "grid":
        return `${baseStyles} hover:shadow-lg`
      default:
        return `${baseStyles} hover:shadow-2xl hover:shadow-blue-900/20 hover:translate-y-[-6px] hover:scale-[1.03]`
    }
  }

  // Reusable action buttons component
  const renderActionButtons = (className: string = "") => (
    <div className={`absolute bottom-2 right-2 ${className}`}>
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
        itemType="vc"
        initialSaved={localIsSaved}
        onSaveChange={handleSaveChange}
        className={`h-8 w-8 ${localIsSaved ? "text-blue-500" : "text-gray-500 hover:text-gray-700"}`}
      />
    </div>
  )

  // Common portfolio score display
  const portfolioInfo = (
    <>
      {(vcScore || 0) > 0 && (
        <div className="flex items-center mt-4 mr-2">
          <Award className="h-3.5 w-3.5 text-orange-500 mr-1" />
          <span className="text-sm font-medium">
            VC Score: {vcScore || 0}
          </span>
          <span className="text-sm font-medium">
            &nbsp; 
          </span>
          <span className="text-sm font-medium">
            | {numberOfPortfolioCompanies || 0} {numberOfPortfolioCompanies === 1 ? "startup" : "startups"}
          </span>
        </div>
      )}
    </>
  )

  // Reusable VC info component
  const renderVCInfo = (logoSize: number = 40, showDescription: boolean = true) => (
    <div className="flex items-start gap-3 sm:gap-4 w-full overflow-hidden">

      {/* VC Logo */}
      <div className="flex-shrink-0">
        <CompanyLogo
          domain={website}
          name={name}
          size={logoSize}
          type="vc"
          className="flex-shrink-0"
          onLoad={() => setIsImageLoaded(true)}
        />
      </div>

      {/* VC Name, City, and Website */}
      <div className="flex-1 min-w-0 overflow-hidden">
        <EnhancedTooltip title={name} description={showDescription ? (description || "") : ""}>
          <h3 className="text-base sm:text-lg font-semibold line-clamp-2 mb-1">{name}</h3>
        </EnhancedTooltip>

        {(city || state) && (
          <p className="text-sm text-muted-foreground line-clamp-1 mb-3">
            {city ? city : ""}{city && state ? "," : ""} {state ? state : ""}
          </p>
        )}

        {website && (
          <a
            href={website.startsWith("http") ? website : `https://${website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-sm text-blue-500 hover:text-blue-600 mb-2"
            onClick={(e) => e.stopPropagation()}
          >
            {website}
            <ExternalLink className="ml-1 h-3 w-3 flex-shrink-0" />
          </a>
        )}
        {portfolioInfo}
      </div>
    </div>
  )

  // Determine content layout based on variant
  const renderContent = (variant: string = "list") => {
    switch (variant) {
      case "grid":
        return (
          <CardContent className="p-4 h-full flex flex-col">
            <Button
              variant="ghost"
              className="h-full w-full justify-start text-left flex flex-col overflow-hidden"
              onClick={handleCardClick}
            >
              <div className="flex flex-col w-full overflow-hidden">
                {/* VC Info */}
                {renderVCInfo(32, false)}
              </div>
            </Button>
            {/* Action Buttons - Bottom Right */}
            <div>
              {renderActionButtons()}
            </div>
          </CardContent>
        )
      case "list":
        return (
          <CardContent className="p-0 h-full overflow-hidden relative">
            <Button
              variant="ghost"
              className="h-full w-full justify-start p-4 sm:p-6 text-left flex flex-col overflow-hidden"
              onClick={handleCardClick}
            >
              <div className="flex flex-col w-full overflow-hidden">
                {/* VC Info */}
                {renderVCInfo(40, true)}
              </div>
            </Button>
            {/* Action Buttons - Bottom Right */}
            <div className="mt-2 self-end">
      {renderActionButtons()}
  </div>
          </CardContent>
        )
      default:
        return null
    }
  }

  // Wrap with motion if animation is enabled
  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: Math.min(0.03 * index, 0.15) }}
        className="h-full"
        layout
      >
        <Card className={getCardStyles()}>{renderContent()}</Card>
      </motion.div>
    )
  }

  return <Card className={getCardStyles()}>{renderContent()}</Card>
})


