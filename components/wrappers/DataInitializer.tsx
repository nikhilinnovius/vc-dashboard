"use client"

import { useEffect } from 'react'
import { useVcStore } from '@/stores/useVcStore'
import { useStartupStore } from '@/stores/useStartupStore'
import { useSearchPoolSync } from '@/stores/useSearchPool'
import { warmupLogoCache } from '@/lib/cache-warmer'

/**
 * DataInitializer - Global data fetching and search pool initialization
 * 
 * This component should be mounted at the app level (in layout.tsx) to ensure:
 * 1. VCs are loaded immediately on app start
 * 2. Startups are loaded immediately on app start  
 * 3. Search pool is automatically synchronized and ready
 * 
 * This increases TTI but provides instant navigation and search after initial load.
 */
export function DataInitializer() {
  const { vcs, isLoading: vcLoading, fetchVcs } = useVcStore()
  const { startups, isLoading: startupLoading, fetchStartups } = useStartupStore()
  
  // Debug logging
  console.log('🔍 DataInitializer State:', { 
    vcsLength: vcs.length, 
    vcLoading, 
    startupsLength: startups.length, 
    startupLoading 
  })
  
  // This hook automatically syncs the search pool when VC/startup data changes
  const { isInitialized, totalItems, vcCount, companyCount } = useSearchPoolSync()

  // Load VCs and startups immediately on app start - single effect
  useEffect(() => {
    console.log('🔍 DataInitializer: Checking data state', { 
      vcsLength: vcs.length, 
      vcLoading, 
      startupsLength: startups.length, 
      startupLoading 
    })
    
    // Only fetch if not already loading and no data exists
    if (vcs.length === 0 && !vcLoading) {
      console.log('DataInitializer: Loading all VCs for global access...')
      fetchVcs().catch(console.error)
    }
    
    if (startups.length === 0 && !startupLoading) {
      console.log('DataInitializer: Loading all startups for global access...')
      fetchStartups().catch(console.error)
    }
  }, []) // Empty dependency array - only run once on mount

  // Log when everything is ready and warm up cache (only once)
  useEffect(() => {
    if (isInitialized && !vcLoading && !startupLoading) {
      console.log(`✅ Global data ready: ${vcCount} VCs, ${companyCount} companies, ${totalItems} total searchable items`)
      
      // Warm up cache for top companies to improve cold start performance
      if (startups.length > 0) {
        warmupLogoCache(startups).catch(console.error)
      }
    }
  }, [isInitialized, vcLoading, startupLoading, vcCount, companyCount, totalItems, startups])

  // This component doesn't render anything - it's just for data initialization
  return null
}
