import { NextRequest, NextResponse } from "next/server"
// import Papa from "papaparse"

// Cache for search data
let searchCache: any = null
let cacheTimestamp = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

interface SearchResult {
  id: string
  name: string
  city: string
  state: string
  type: "vc" | "startup"
  website?: string
  domain?: string
}

async function getSearchData() {
  const now = Date.now()
  
  // Return cached data if available and not expired
  if (searchCache && now - cacheTimestamp < CACHE_DURATION) {
    return searchCache
  }

  try {
    // Fetch CSV data directly from S3 for server-side search
    const response = await fetch("https://vc-dashboard-data.s3.us-east-2.amazonaws.com/portfolio_qualified.csv", {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch CSV from S3: ${response.status} ${response.statusText}`)
    }

    const csvText = await response.text()
    if (!csvText || csvText.trim().length === 0) {
      throw new Error("Received empty CSV data from S3")
    }

    // Parse CSV
    const results = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    })

    if (!results.data || !Array.isArray(results.data)) {
      throw new Error("Invalid CSV data")
    }

    const vcMap = new Map<string, SearchResult>()
    const startups: SearchResult[] = []

    // Process data for search
    for (const row of results.data) {
      try {
        const vcName = row["VC Name"]
        const startupName = row["Startup Name"]

        // Process VCs
        if (vcName && !vcMap.has(vcName)) {
          const vcId = `vc-${vcName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
          const vcCity = row["VC City"] || row["Startup City Location"] || "Unknown"
          const vcState = row["VC State"] || row["Startup State Location"] || "Unknown"

          vcMap.set(vcName, {
            id: vcId,
            name: vcName,
            city: vcCity,
            state: vcState,
            type: "vc",
            website: row["VC Website"] || "",
          })
        }

        // Process Startups
        if (startupName) {
          const startupId = `startup-${startupName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
          const city = row["Startup City Location"] || "Unknown"
          const state = row["Startup State Location"] || "Unknown"

          startups.push({
            id: startupId,
            name: startupName,
            city: city,
            state: state,
            type: "startup",
            website: row["Startup Website"] || "",
            domain: row["Startup Website"] || "",
          })
        }
      } catch (err) {
        console.error("Error processing search data row:", err)
      }
    }

    // Deduplicate startups by name+city combination
    const uniqueStartups = Array.from(
      new Map(
        startups.map((startup) => [`${startup.name}-${startup.city}`, startup])
      ).values()
    )

    searchCache = {
      vcs: Array.from(vcMap.values()),
      startups: uniqueStartups,
    }
    cacheTimestamp = now

    return searchCache
  } catch (error) {
    console.error("Error in getSearchData:", error)
    throw error
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")?.toLowerCase().trim() || ""
    const limit = parseInt(searchParams.get("limit") || "20")

    if (!query) {
      return NextResponse.json({ results: [] })
    }

    const data = await getSearchData()
    
    // Search VCs
    const vcResults = data.vcs
      .filter((vc: SearchResult) => {
        const name = (vc.name || "").toLowerCase()
        const city = (vc.city || "").toLowerCase()
        const state = (vc.state || "").toLowerCase()
        
        return name.includes(query) || city.includes(query) || state.includes(query)
      })
      .slice(0, Math.floor(limit / 2))

    // Search Startups
    const startupResults = data.startups
      .filter((startup: SearchResult) => {
        const name = (startup.name || "").toLowerCase()
        const city = (startup.city || "").toLowerCase()
        const state = (startup.state || "").toLowerCase()
        
        return name.includes(query) || city.includes(query) || state.includes(query)
      })
      .slice(0, Math.floor(limit / 2))

    const results = [...vcResults, ...startupResults]

    return NextResponse.json({
      results,
      total: results.length,
      query,
    })
  } catch (error) {
    console.error("Search API error:", error)
    return NextResponse.json(
      { error: "Failed to perform search", results: [] },
      { status: 500 }
    )
  }
}
