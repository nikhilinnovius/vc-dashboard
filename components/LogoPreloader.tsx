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
    // Preload logos for current page and next page
    const pagesToPreload = [currentPage, currentPage + 1].filter(page => 
      page <= totalPages && !preloadedPages.current.has(page)
    )
    
    pagesToPreload.forEach(page => {
      preloadedPages.current.add(page)
      
      // Calculate which startups would be on this page
      const startIndex = (page - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      const pageStartups = startups.slice(startIndex, endIndex)
      
      // Extract domains for preloading
      const domains = pageStartups
        .map(startup => startup.website)
        .filter(Boolean)
        .slice(0, 10) // Only preload first 10 to avoid overwhelming

      if (domains.length > 0) {
        console.log(`Preloading logos for page ${page}:`, domains.length, 'domains')
        preloadLogos(domains)
      }
    })
  }, [currentPage, totalPages, startups, itemsPerPage, preloadLogos])

  // This component doesn't render anything
  return null
}

