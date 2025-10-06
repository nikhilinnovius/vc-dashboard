/**
 * Cache warming utilities to improve cold start performance
 */

interface CacheWarmupConfig {
  maxConcurrent: number
  batchSize: number
  delayBetweenBatches: number
}

const DEFAULT_CONFIG: CacheWarmupConfig = {
  maxConcurrent: 5,
  batchSize: 10,
  delayBetweenBatches: 1000,
}

/**
 * Warms up the cache by preloading logos for the most important companies
 */
export async function warmupLogoCache(
  companies: Array<{ website?: string; name: string; companyScore?: number }>,
  config: Partial<CacheWarmupConfig> = {}
): Promise<void> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  
  // Sort by company score (highest first) and take top companies
  const topCompanies = companies
    .filter(company => company.website)
    .sort((a, b) => (b.companyScore || 0) - (a.companyScore || 0))
    .slice(0, 20) // Only warm up top 20 companies for faster warming

  console.log(`🔥 Warming up cache for ${topCompanies.length} top companies`)

  // Process in smaller batches for faster warming
  for (let i = 0; i < topCompanies.length; i += 5) {
    const batch = topCompanies.slice(i, i + 5)
    
    const batchPromises = batch.map(async (company) => {
      try {
        const response = await fetch(`/api/logos/${encodeURIComponent(company.website!)}`, {
          cache: "force-cache",
          next: { revalidate: 3600 },
        })
        
        if (response.ok) {
          const data = await response.json()
          console.log(`✅ Cache warmed for ${company.name}: ${data.url ? 'SUCCESS' : 'NO LOGO'}`)
        } else {
          console.warn(`⚠️ Cache warming failed for ${company.name}: HTTP ${response.status}`)
        }
      } catch (error) {
        console.warn(`⚠️ Failed to warm cache for ${company.name}:`, error)
      }
    })

    await Promise.allSettled(batchPromises)
    
    // Shorter delay between batches for faster warming
    if (i + 5 < topCompanies.length) {
      await new Promise(resolve => setTimeout(resolve, 200))
    }
  }
  
  console.log('🔥 Cache warming completed')
}

/**
 * Preloads logos for a specific page of companies
 */
export async function preloadPageLogos(
  companies: Array<{ website?: string; name: string }>,
  page: number,
  itemsPerPage: number = 20
): Promise<void> {
  const startIndex = (page - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const pageCompanies = companies.slice(startIndex, endIndex)
  
  const domains = pageCompanies
    .map(company => company.website)
    .filter(Boolean)
    .slice(0, 10) // Only preload first 10 to avoid overwhelming

  if (domains.length === 0) return

  console.log(`📄 Preloading logos for page ${page}:`, domains.length, 'domains')

  const promises = domains.map(async (domain) => {
    try {
      await fetch(`/api/logos/${encodeURIComponent(domain!)}`, {
        cache: "force-cache",
        next: { revalidate: 3600 },
      })
    } catch (error) {
      console.warn(`⚠️ Failed to preload logo for ${domain}:`, error)
    }
  })

  await Promise.allSettled(promises)
}

/**
 * Gets cache statistics for monitoring
 */
export function getCacheStats() {
  // This would integrate with your actual cache implementation
  return {
    timestamp: Date.now(),
    // Add actual cache metrics here
  }
}
