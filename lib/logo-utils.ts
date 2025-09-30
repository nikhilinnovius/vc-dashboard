import { put } from "@vercel/blob"
import { kv } from "@vercel/kv"

// Cache duration in seconds (7 days instead of 30)
const LOGO_CACHE_DURATION = 7 * 24 * 60 * 60
// Error cache duration (only 6 hours)
const LOGO_ERROR_CACHE_DURATION = 6 * 60 * 60
const LOGO_API_TOKEN = "pk_PUbeKQxPQmiCFlIT4ADVlQ"
const LOGO_API_SIZE = "128"
const LOGO_API_FORMAT = "png"

// Type for logo metadata stored in KV
interface LogoMetadata {
  url: string
  domain: string
  timestamp: number
  status: "success" | "error"
}

/**
 * Fetches a logo for a domain and stores it in Vercel Blob
 */
export async function fetchAndStoreCompanyLogo(domain: string, forceRefresh = false): Promise<string> {
  if (!domain) {
    return getDefaultLogoUrl()
  }

  // Clean the domain (remove protocol, www, trailing slashes)
  const cleanDomain = cleanDomainName(domain)

  console.log(`Fetching logo for domain: ${cleanDomain}, forceRefresh: ${forceRefresh}`)

  // Check if we already have this logo in KV cache
  if (!forceRefresh) {
    const cachedLogo = await getLogoFromCache(cleanDomain)
    if (cachedLogo) {
      console.log(`Using cached logo for ${cleanDomain}: ${cachedLogo}`)
      return cachedLogo
    }
  }

  try {
    // Fetch the logo from the API
    const logoApiUrl = `https://img.logo.dev/${cleanDomain}?token=${LOGO_API_TOKEN}&size=${LOGO_API_SIZE}&format=${LOGO_API_FORMAT}`
    console.log(`Fetching logo from API: ${logoApiUrl}`)

    // Set a timeout for the fetch operation
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // Increased timeout to 10 seconds

    // Fetch the image
    const response = await fetch(logoApiUrl, { signal: controller.signal })
    clearTimeout(timeoutId)

    if (!response.ok) {
      console.error(`Failed to fetch logo from API: ${response.status} ${response.statusText}`)
      throw new Error(`Failed to fetch logo: ${response.status} ${response.statusText}`)
    }

    // Get the image as a blob
    const imageBlob = await response.blob()
    console.log(`Received logo image for ${cleanDomain}, size: ${imageBlob.size} bytes, type: ${imageBlob.type}`)

    // Less strict size check - only reject if truly empty
    if (imageBlob.size < 50) {
      console.error(`Invalid logo image (too small): ${imageBlob.size} bytes`)
      throw new Error("Invalid logo image (too small)")
    }

    // Store in Vercel Blob
    const blobResult = await put(`logos/${cleanDomain}-${Date.now()}.png`, imageBlob, {
      access: "public",
      contentType: "image/png",
      addRandomSuffix: true, // Use random suffix to avoid caching issues
    })

    console.log(`Stored logo in Vercel Blob: ${blobResult.url}`)

    // Store metadata in KV
    const metadata: LogoMetadata = {
      url: blobResult.url,
      domain: cleanDomain,
      timestamp: Date.now(),
      status: "success",
    }

    await kv.set(`logo:${cleanDomain}`, JSON.stringify(metadata), {
      ex: LOGO_CACHE_DURATION,
    })

    return blobResult.url
  } catch (error) {
    console.error(`Error fetching logo for ${domain}:`, error)

    // Store error status in KV to avoid repeated failed attempts
    const metadata: LogoMetadata = {
      url: getDefaultLogoUrl(),
      domain: cleanDomain,
      timestamp: Date.now(),
      status: "error",
    }

    await kv.set(`logo:${cleanDomain}`, JSON.stringify(metadata), {
      ex: LOGO_ERROR_CACHE_DURATION, // Cache errors for shorter time (6 hours)
    })

    return getDefaultLogoUrl()
  }
}

/**
 * Gets a logo URL from cache if available
 */
export async function getLogoFromCache(domain: string): Promise<string | null> {
  if (!domain) return null

  const cleanDomain = cleanDomainName(domain)

  try {
    const cachedData = await kv.get(`logo:${cleanDomain}`)

    if (cachedData) {
      const metadata = JSON.parse(cachedData as string) as LogoMetadata

      // Check if the cached data is still valid (not too old)
      const now = Date.now()
      const cacheAge = now - metadata.timestamp

      // If it's an error and older than 6 hours, don't use it
      if (metadata.status === "error" && cacheAge > LOGO_ERROR_CACHE_DURATION * 1000) {
        console.log(`Cached error for ${cleanDomain} is too old, will fetch fresh`)
        return null
      }

      return metadata.url
    }
  } catch (error) {
    console.error("Error retrieving logo from cache:", error)
  }

  return null
}

/**
 * Gets a company logo URL, either from cache or by fetching it
 */
export async function getCompanyLogoUrl(domain: string): Promise<string> {
  if (!domain) {
    return getDefaultLogoUrl()
  }

  const cleanDomain = cleanDomainName(domain)

  // Try to get from cache first
  const cachedLogo = await getLogoFromCache(cleanDomain)
  if (cachedLogo) {
    return cachedLogo
  }

  // If not in cache, fetch and store
  return fetchAndStoreCompanyLogo(cleanDomain)
}

/**
 * Cleans a domain name by removing protocol, www, and trailing slashes
 */
export function cleanDomainName(domain: string): string {
  if (!domain) return ""

  // Remove protocol (http://, https://)
  let cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/i, "")

  // Remove trailing slashes and anything after
  cleanDomain = cleanDomain.split("/")[0]

  // Remove port if present
  cleanDomain = cleanDomain.split(":")[0]

  return cleanDomain.toLowerCase()
}

/**
 * Returns the default logo URL to use as fallback
 */
export function getDefaultLogoUrl(): string {
  return "/placeholder.svg?height=128&width=128"
}
