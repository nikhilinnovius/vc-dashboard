"use client"

import { useState, useCallback, memo } from "react"
import Image from "next/image"
import { Building2 } from "lucide-react"
import { useCompanyLogo } from "@/hooks/use-company-logo"

interface CompanyLogoProps {
  domain?: string
  name: string
  size?: number
  className?: string
  type?: "vc" | "startup"
  onLoad?: () => void
  priority?: number
}

// Memoized component for better performance
export const CompanyLogo = memo(function CompanyLogo({
  domain,
  name,
  size = 32,
  className = "",
  type = "startup",
  onLoad,
  priority = 0,
}: CompanyLogoProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const { logoUrl, isLoading, error, retry } = useCompanyLogo(domain, name, priority)

  const handleImageLoad = useCallback(() => {
    console.log('image loaded')
    setImageLoaded(true)
    setImageError(false)
    console.log('isLoading', isLoading)
    onLoad?.()
  }, [onLoad])

  const handleImageError = useCallback(() => {
    setImageError(true)
    setImageLoaded(false)
    // Add automatic retry once on error
    if (logoUrl) {
      retry()
    }
  }, [logoUrl, retry])

  const shouldShowFallback = !logoUrl || imageError || error

  if (shouldShowFallback) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border border-gray-200 ${className}`}
        style={{ width: size, height: size }}
        title={name}
      >
        <Building2 className="text-gray-400" size={Math.max(12, size * 0.4)} />
      </div>
    )
  }

  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-gray-200 ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Loading placeholder */}
      {(isLoading || !imageLoaded) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse">
          <Building2 className="text-gray-400" size={Math.max(12, size * 0.4)} />
        </div>
      )}
      {/* Image */}
      {logoUrl && (
        <Image
          src={logoUrl || "/placeholder.svg"}
          alt={name}
          width={size}
          height={size}
          className="object-cover"
          onLoad={handleImageLoad}
          onError={handleImageError}
          unoptimized={true} // Add this to bypass Next.js image optimization which might be causing issues
        />
      )}
    </div>
  )
})
