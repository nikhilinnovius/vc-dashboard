"use client"

import { useEffect } from 'react'
import { useVcStore } from '@/stores/useVcStore'
import { useStartupStore } from '@/stores/useStartupStore'
import { useSearchPoolSync } from '@/stores/useSearchPool'

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

  // Load VCs immediately on app start
  useEffect(() => {
    console.log('🔍 DataInitializer VC Effect:', { vcsLength: vcs.length, vcLoading })
    if (vcs.length === 0 && !vcLoading) {
      console.log('DataInitializer: Loading all VCs for global access...')
      fetchVcs().catch(console.error)
    } else {
      console.log('DataInitializer: Skipping VC fetch:', { vcsLength: vcs.length, vcLoading })
    }
  }, [vcs.length, vcLoading, fetchVcs])

  // Load startups immediately on app start  
  useEffect(() => {
    console.log('🔍 DataInitializer Startup Effect:', { startupsLength: startups.length, startupLoading })
    if (startups.length === 0 && !startupLoading) {
      console.log('DataInitializer: Loading all startups for global access...')
      fetchStartups().catch(console.error)
    } else {
      console.log('DataInitializer: Skipping startup fetch:', { startupsLength: startups.length, startupLoading })
    }
  }, [startups.length, startupLoading, fetchStartups])

  // Log when everything is ready (only once)
  useEffect(() => {
    if (isInitialized && !vcLoading && !startupLoading) {
      console.log(`✅ Global data ready: ${vcCount} VCs, ${companyCount} companies, ${totalItems} total searchable items`)
    }
  }, [isInitialized, vcLoading, startupLoading, vcCount, companyCount, totalItems])
  // Additional debug when VCs change
  useEffect(() => {
    console.log('🔍 DataInitializer VCs changed:', vcs.length)
  }, [vcs.length])

  // Force fetch on mount as backup - more aggressive approach
  useEffect(() => {
    console.log('1.DataInitializer: Force fetch on mount')
    const timer = setTimeout(() => {
      if (vcs.length === 0 && !vcLoading) {
        console.log('Force fetching VCs after 1s delay')
        fetchVcs().catch(console.error)
      }
      if (startups.length === 0 && !startupLoading) {
        console.log('Force fetching startups after 1s delay')
        fetchStartups().catch(console.error)
      }
    }, 1000)
    
    return () => clearTimeout(timer)
  }, []) // Run only once on mount

  // This component doesn't render anything - it's just for data initialization
  return null
}
