"use client"

import { useEffect, useRef } from "react"
import { useLogoPreloader } from "@/hooks/use-priority-logo-loading"

interface LogoPreloaderProps {
  startups: any[]
  currentPage: number
  totalPages: number
  itemsPerPage?: number
}

export function LogoPreloader({ 
  startups, 
  currentPage, 
  totalPages, 
  itemsPerPage = 20 
}: LogoPreloaderProps) {
  const { preloadLogos } = useLogoPreloader()
  const preloadedPages = useRef(new Set<number>())

  useEffect(() => {
    // Preload logos for next page
    const nextPage = currentPage + 1
    if (nextPage <= totalPages && !preloadedPages.current.has(nextPage)) {
      preloadedPages.current.add(nextPage)
      
      // Calculate which startups would be on the next page
      const startIndex = nextPage * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      const nextPageStartups = startups.slice(startIndex, endIndex)
      
      // Extract domains for preloading
      const domains = nextPageStartups
        .map(startup => startup.website)
        .filter(Boolean)
        .slice(0, 10) // Only preload first 10 to avoid overwhelming

      if (domains.length > 0) {
        console.log(`Preloading logos for page ${nextPage}:`, domains.length, 'domains')
        preloadLogos(domains)
      }
    }
  }, [currentPage, totalPages, startups, itemsPerPage, preloadLogos])

  // This component doesn't render anything
  return null
}

