import React from 'react'
import { Loader2 } from "lucide-react"
import { VCGridSkeleton, StartupGridSkeleton } from "@/components/skeleton-components"

interface LoadingIndicatorProps {
  entityType?: string
  showSkeleton?: boolean
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  entityType, 
  showSkeleton = true 
}) => {
  if (showSkeleton) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-white/20 rounded animate-pulse" />
            <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
          </div>
        </div>
        {entityType === "startup" ? <StartupGridSkeleton count={12} /> : <VCGridSkeleton count={12} />}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="h-12 w-12 text-white animate-spin mb-4" />
      <p className="text-white text-xl">
        {entityType === "startup" ? "Loading Startups..." : "Loading VCs..."}
      </p>
    </div>
  )
}

interface ErrorDisplayProps {
  error: string
  onRetry: () => void
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-10">
    <p className="text-white text-xl mb-4">Error loading data</p>
    <p className="text-white/70 mb-6 max-w-md text-center">
      {error || "An unexpected error occurred. Please try again."}
    </p>
    <button 
      onClick={onRetry} 
      className="bg-white/20 text-white hover:bg-white/30 px-4 py-2 rounded"
    >
      Try Again
    </button>
  </div>
)
