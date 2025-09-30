import { NextResponse } from "next/server"
import { fetchAndStoreCompanyLogo, getLogoFromCache, cleanDomainName } from "@/lib/logo-utils"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: { domain: string } }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const domain = decodeURIComponent(params.domain)
    const cleanDomain = cleanDomainName(domain)

    if (!cleanDomain) {
      return NextResponse.json({ error: "Invalid domain" }, { status: 400 })
    }

    // Check for force refresh in query params
    const { searchParams } = new URL(request.url)
    const forceRefresh = searchParams.get("refresh") === "true"
    const retryCount = Number.parseInt(searchParams.get("retry") || "0", 10)

    console.log(`Logo API request for ${cleanDomain}, forceRefresh: ${forceRefresh}, retryCount: ${retryCount}`)

    // Try to get from cache first unless force refresh is requested
    if (!forceRefresh) {
      const cachedLogo = await getLogoFromCache(cleanDomain)
      if (cachedLogo) {
        console.log(`Returning cached logo for ${cleanDomain}: ${cachedLogo}`)
        // Return with shorter cache headers to allow for refreshing
        const response = NextResponse.json({
          url: cachedLogo,
          domain: cleanDomain,
          cached: true,
          timestamp: Date.now(), // Add timestamp for debugging
        })
        response.headers.set("Cache-Control", "public, max-age=3600, s-maxage=86400") // 1 hour browser cache, 1 day CDN cache
        return response
      }
    }

    // Fetch and store the logo
    console.log(`Fetching fresh logo for ${cleanDomain}`)
    const logoUrl = await fetchAndStoreCompanyLogo(cleanDomain, forceRefresh)

    // Return with shorter cache headers
    const response = NextResponse.json({
      url: logoUrl,
      domain: cleanDomain,
      cached: false,
      refreshed: forceRefresh,
      retryCount,
      timestamp: Date.now(), // Add timestamp for debugging
    })

    // Set cache control headers - shorter for retries
    const maxAge = retryCount > 0 ? 300 : 3600 // 5 minutes for retries, 1 hour otherwise
    response.headers.set("Cache-Control", `public, max-age=${maxAge}, s-maxage=${maxAge * 2}`)

    return response
  } catch (error) {
    console.error("Error in logo API:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch logo",
        message: error instanceof Error ? error.message : String(error),
        timestamp: Date.now(), // Add timestamp for debugging
      },
      { status: 500 },
    )
  }
}
