import { NextRequest, NextResponse } from "next/server"
import Papa from "papaparse"

// Cache for VC portfolio data
let portfolioCache = new Map<string, any>()
let cacheTimestamp = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

interface StartupData {
  id: string
  name: string
  city: string
  state: string
  website?: string
  description?: string
  summary?: string
  linkedin?: string
  foundedDate?: string
  companyStatus?: string
  companyScore?: string
  scoreReasoning?: string
  flaggedBy?: string
  recentFunding?: string
  lastFundingAmount?: string
  totalRaised?: string
  currentInvestors?: string
  innoviusInvestorConnections?: string
  ceoLinkedin?: string
  vcId?: string
  lastRound?: string
  startupTotalEmployees?: string
  innoviusCoverage?: string
  startupExcitement?: string
  connectedWithCompany?: string
  headcount180d?: string
  headcount1y?: string
  sales1y?: string
  webTraffic1y?: string
  webTraffic180d?: string
  salesGrowth180d?: string
  businessModel?: string
  conferences?: string
  endMarket?: string
  subVertical?: string
  expectedRaise?: string
  domain?: string
}

async function loadVCPortfolioData() {
  const now = Date.now()
  
  // Return cached data if available and not expired
  if (portfolioCache.size > 0 && now - cacheTimestamp < CACHE_DURATION) {
    return portfolioCache
  }

  try {
    // Fetch CSV data directly from S3
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

    // Clear old cache
    portfolioCache.clear()

    // Process data and group by VC
    for (const row of results.data) {
      try {
        const vcName = row["VC Name"]
        const startupName = row["Startup Name"]

        if (!vcName || !startupName) continue

        const vcId = `vc-${vcName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
        
        // Initialize VC portfolio if doesn't exist
        if (!portfolioCache.has(vcId)) {
          portfolioCache.set(vcId, {
            vcName: vcName,
            vcId: vcId,
            startups: [],
            vcInfo: {
              city: row["VC City"] || row["Startup City Location"] || "Unknown",
              state: row["VC State"] || row["Startup State Location"] || "Unknown",
              website: row["VC Website"] || "",
              portfolioCompanyScore: row["Portfolio Company Score"] || row["VC Portfolio Company Score"] || "0",
              aum: row["VC AUM"] || row["AUM"] || "",
              stageDistribution: row["VC Stage Distribution"] || "",
            }
          })
        }

        const vcData = portfolioCache.get(vcId)
        
        // Add startup to VC portfolio
        const startup: StartupData = {
          id: `startup-${startupName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
          name: startupName,
          city: row["Startup City Location"] || "Unknown",
          state: row["Startup State Location"] || "Unknown",
          website: row["Startup Website"] || "",
          description: row["Startup Summary"] || "No description available",
          summary: row["Startup Summary"] || "",
          linkedin: row["Startup LinkedIn"] || "",
          foundedDate: row["Startup Founded Date"] || "",
          companyStatus: row["Company Status"] || "",
          companyScore: row["Company Score"] || "",
          scoreReasoning: row["Score Reasoning"] || "",
          flaggedBy: row["Flagged By (Internal & External)"] || "",
          recentFunding: row["Startup Most Recent Funding"] || "",
          lastFundingAmount: row["Startup Last Funding Amount"] || "",
          totalRaised: row["Startup Total Raised"] || "",
          currentInvestors: row["Startup Current Investors"] || "",
          innoviusInvestorConnections: row["Startup Innovius Investor Connections"] || "",
          ceoLinkedin: row["Startup CEO LinkedIn"] || "",
          vcId: vcId,
          lastRound: row["Startup Last Round"] || "",
          startupTotalEmployees: row["Startup Total Employees"] || "",
          innoviusCoverage: row["Startup Innovius Coverage"] || "",
          startupExcitement: row["Startup Excitement"] || "",
          connectedWithCompany: row["Startup Connected w/ Company?"] || "",
          headcount180d: row["Startup 180d Headcount %"] || "",
          headcount1y: row["Startup 1 Year Headcount %"] || "",
          sales1y: row["Startup 1 Year Sales %"] || "",
          webTraffic1y: row["Startup 1 Year Web Traffic %"] || "",
          webTraffic180d: row["Startup 180d Web Traffic %"] || "",
          salesGrowth180d: row["Startup 180d Sales Growth %"] || "",
          businessModel: row["Startup Business Model"] || "",
          conferences: row["Startup Conferences"] || "",
          endMarket: row["Startup End Market"] || "",
          subVertical: row["Startup Sub Vertical"] || "",
          expectedRaise: row["Startup Expected Raise"] || "",
          domain: row["Startup Website"] || "",
        }

        vcData.startups.push(startup)
      } catch (err) {
        console.error("Error processing portfolio data row:", err)
      }
    }

    // Sort startups by company score within each VC portfolio
    for (const [vcId, vcData] of portfolioCache.entries()) {
      vcData.startups.sort((a: StartupData, b: StartupData) => {
        const scoreA = a.companyScore ? parseFloat(a.companyScore) : 0
        const scoreB = b.companyScore ? parseFloat(b.companyScore) : 0
        return scoreB - scoreA
      })
    }

    cacheTimestamp = now
    return portfolioCache
  } catch (error) {
    console.error("Error in loadVCPortfolioData:", error)
    throw error
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const vcName = searchParams.get("vc")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")

    if (!vcName) {
      return NextResponse.json({ error: "VC name is required" }, { status: 400 })
    }

    const vcId = `vc-${vcName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
    
    const portfolioData = await loadVCPortfolioData()
    const vcData = portfolioData.get(vcId)

    if (!vcData) {
      return NextResponse.json({
        vcName,
        vcId,
        startups: [],
        vcInfo: null,
        totalItems: 0,
        totalPages: 0,
        currentPage: page,
      })
    }

    // Apply pagination
    const totalItems = vcData.startups.length
    const totalPages = Math.ceil(totalItems / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedStartups = vcData.startups.slice(startIndex, endIndex)

    return NextResponse.json({
      vcName: vcData.vcName,
      vcId: vcData.vcId,
      startups: paginatedStartups,
      vcInfo: vcData.vcInfo,
      totalItems,
      totalPages,
      currentPage: page,
    })
  } catch (error) {
    console.error("VC Portfolio API error:", error)
    return NextResponse.json(
      { error: "Failed to load VC portfolio", startups: [] },
      { status: 500 }
    )
  }
}
