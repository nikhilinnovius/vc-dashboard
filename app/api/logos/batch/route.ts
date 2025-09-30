import { NextResponse } from "next/server"
import { fetchAndStoreCompanyLogo } from "@/lib/logo-utils"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { fetchCSVData } from "@/lib/data-utils"

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get request body
    const body = await request.json()
    const { forceRefresh = false } = body

    // Fetch all company data
    const { vcs, startups } = await fetchCSVData()

    // Extract unique domains
    const vcDomains = vcs.map((vc) => vc.website).filter(Boolean)
    const startupDomains = startups.map((startup) => startup.website).filter(Boolean)

    // Combine and deduplicate domains
    const allDomains = [...new Set([...vcDomains, ...startupDomains])]

    // Process in batches to avoid overwhelming the system
    const batchSize = 5
    const results = {
      total: allDomains.length,
      processed: 0,
      successful: 0,
      failed: 0,
      errors: [] as string[],
    }

    // Process in batches
    for (let i = 0; i < allDomains.length; i += batchSize) {
      const batch = allDomains.slice(i, i + batchSize)

      // Process each domain in the batch concurrently
      const batchPromises = batch.map(async (domain) => {
        try {
          await fetchAndStoreCompanyLogo(domain, forceRefresh)
          results.successful++
          return { domain, success: true }
        } catch (error) {
          results.failed++
          const errorMessage = error instanceof Error ? error.message : String(error)
          results.errors.push(`${domain}: ${errorMessage}`)
          return { domain, success: false, error: errorMessage }
        } finally {
          results.processed++
        }
      })

      await Promise.all(batchPromises)

      // Add a small delay between batches to avoid rate limiting
      if (i + batchSize < allDomains.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error("Error in batch logo processing:", error)
    return NextResponse.json(
      { error: "Failed to process logos", message: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
