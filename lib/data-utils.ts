import Papa from "papaparse"

const DEBUG = true
const API_ENDPOINT = "/api/csv-data"

function log(...args: any[]) {
  if (DEBUG) {
    console.error("[Data Utils]", ...args) // Using console.error for better visibility
  }
}

// Updated types with all required fields
export interface VentureData {
  id: string
  name: string
  city?: string
  state?: string
  website?: string
  description?: string
  logo?: string
  vcScore?: number 
  aum?: string 
  stageDistribution?: string
  inAffinity?: boolean
  numberOfPortfolioCompanies?: number
}

export interface StartupData {
  id: string
  name: string
  website: string
  city?: string
  state?: string
  description?: string
  linkedin?: string
  foundedDate?: string // ISO date string
  companyStatus?: string
  companyScore?: number
  scoreReasoning?: string
  flaggedByInternalAndExternal?: string
  mostRecentFunding?: string
  lastFundingAmount?: number
  totalRaised?: number
  currentInvestors?: string[]
  ceoLinkedin?: string
  endMarket?: string
  businessModel?: string
  subVertical?: string
  totalEmployees?: number
  lastRound?: string
  innoviusCoverage?: string
  headcount180dPct?: number
  headcount1yPct?: number
  sales1yPct?: number
  webTraffic1yPct?: number
  webTraffic180dPct?: number
  sales180dPct?: number
  innoviusConnected?: boolean
  excitement?: string
  expectedRaise?: string
  conferences?: string
  offshoreData?: string
  innoviusInvestorConnections?: string
  raisePredictor?: string
  inAffinity?: boolean
  organizationId?: number
  workflowTriggers?: string
}

export interface NonQualifiedStartupData {
  id: string
  name: string
  website?: string
  vcId?: string // Reference to the VC that invested in this startup
  companyScore?: string // Add this field for the company score
}

// Cache implementation
const dataCache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Updated function to handle billions and millions
function formatAUM(aumValue: string | number): string {
  if (!aumValue) return ""

  const numValue = typeof aumValue === "string" ? Number.parseFloat(aumValue) : aumValue
  if (isNaN(numValue) || numValue === 0) return ""

  // If value is 1 billion or more, format as billions
  if (numValue >= 1000000000) {
    const aumInBillions = Math.round(numValue / 1000000000)
    return `${aumInBillions}B`
  }

  // Otherwise, format as millions
  const aumInMillions = Math.round(numValue / 1000000)
  return `${aumInMillions}M`
}

// // Fixed CSV processing with correct field names
// async function processCSVInChunks(csvText: string, chunkSize = 1000) {
//   const results = Papa.parse(csvText, {
//     header: true,
//     skipEmptyLines: true,
//     error: (error) => {
//       throw new Error(`CSV parsing error: ${error.message}`)
//     },
//   })

//   if (!results.data || !Array.isArray(results.data) || results.data.length === 0) {
//     throw new Error("CSV parsing returned no valid data")
//   }

//   const vcMap = new Map<string, VentureData>()
//   const startups: StartupData[] = []
//   const totalRows = results.data.length

//   // Process in chunks to avoid blocking the main thread
//   for (let i = 0; i < totalRows; i += chunkSize) {
//     const chunk = results.data.slice(i, i + chunkSize)

//     // Process VCs first
//     for (const row of chunk) {
//       try {
//         const vcName = row["VC Name"]
//         if (!vcName) continue

//         const vcId = `vc-${vcName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
//         if (!vcMap.has(vcId)) {
//           const vcCity = row["VC City"] || row["Startup City Location"] || "Unknown"
//           const vcState = row["VC State"] || row["Startup State Location"] || "Unknown"
//           const inAffinityValue = row["In Affinity"] || "False"
//           const inAffinity = inAffinityValue.toLowerCase() === "true"

//           // Extract Portfolio Company Score from CSV
//           const portfolioCompanyScore = row["Portfolio Company Score"] || row["VC Portfolio Company Score"] || "0"
//           const parsedPortfolioScore = Number.parseFloat(portfolioCompanyScore)

//           // Extract AUM from CSV
//           const vcAUM = row["VC AUM"] || row["AUM"] || ""
//           const formattedAUM = formatAUM(vcAUM)

//           vcMap.set(vcId, {
//             id: vcId,
//             name: vcName,
//             city: vcCity,
//             state: vcState,
//             website: row["VC Website"] || "",
//             description: row["VC Description"] || `${vcName} is a venture capital firm.`,
//             logo: "/placeholder.svg",
//             vcScore: isNaN(parsedPortfolioScore) ? 0 : parsedPortfolioScore,
//             aum: formattedAUM, // Add formatted AUM
//             stageDistribution: row["VC Stage Distribution"] || "", // Add stage distribution
//           })

//           log(
//             `Added VC: ${vcName} (${vcCity}, ${vcState}), Portfolio Score: ${parsedPortfolioScore}, In Affinity: ${inAffinity}`,
//           )
//         }
//       } catch (err) {
//         log(`Error processing VC in chunk:`, err)
//       }
//     }

//     // Process startups and count portfolio companies
//     for (const row of chunk) {
//       try {
//         const vcName = row["VC Name"]
//         const startupName = row["Startup Name"]
//         if (!vcName || !startupName) continue

//         const vcId = `vc-${vcName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
//         const startupId = `startup-${startupName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
//         const city = row["Startup City Location"] || "Unknown"
//         const state = row["Startup State Location"] || "Unknown"

//         // Increment portfolio count for the VC
//         const vc = vcMap.get(vcId)
//         if (vc) {
//           vc.portfolioCount = (vc.portfolioCount || 0) + 1
//         }

//         startups.push({
//           id: startupId,
//           name: startupName,
//           city: city,
//           state: state,
//           website: row["Startup Website"] || "",
//           description: row["Startup Summary"] || "No description available",
//           summary: row["Startup Summary"] || "",
//           linkedin: row["Startup LinkedIn"] || "",
//           foundedDate: row["Startup Founded Date"] || "",
//           companyStatus: row["Company Status"] || "",
//           status: row["Status"] || "", // Added Status field
//           companyScore: row["Company Score"] || "",
//           scoreReasoning: row["Score Reasoning"] || "",
//           flaggedBy: row["Flagged By (Internal & External)"] || "",
//           recentFunding: row["Startup Most Recent Funding"] || "",
//           lastFundingAmount: row["Startup Last Funding Amount"] || "",
//           totalRaised: row["Startup Total Raised"] || "",
//           currentInvestors: row["Startup Current Investors"] || "",
//           innoviusInvestorConnections: row["Startup Innovius Investor Connections"] || "",
//           ceoLinkedin: row["Startup CEO LinkedIn"] || "",
//           vcId: vcId,
//           lastRound: row["Startup Last Round"] || "",
//           startupTotalEmployees: row["Startup Total Employees"] || "",
//           innoviusCoverage: row["Startup Innovius Coverage"] || "",
//           startupExcitement: row["Startup Excitement"] || "",
//           connectedWithCompany: row["Startup Connected w/ Company?"] || "",
//           headcount180d: row["Startup 180d Headcount %"] || "",
//           headcount1y: row["Startup 1 Year Headcount %"] || "",
//           sales1y: row["Startup 1 Year Sales %"] || "",
//           webTraffic1y: row["Startup 1 Year Web Traffic %"] || "",
//           webTraffic180d: row["Startup 180d Web Traffic %"] || "",
//           salesGrowth180d: row["Startup 180d Sales Growth %"] || "",
//           businessModel: row["Startup Business Model"] || "",
//           conferences: row["Startup Conferences"] || "",
//           endMarket: row["Startup End Market"] || "",
//           subVertical: row["Startup Sub Vertical"] || "",
//           expectedRaise: row["Startup Expected Raise"] || "",
//         })
//       } catch (err) {
//         log(`Error processing startup in chunk:`, err)
//       }
//     }

//     // Yield control back to the browser every chunk
//     if (i + chunkSize < totalRows) {
//       await new Promise((resolve) => setTimeout(resolve, 0))
//     }
//   }

//   return {
//     vcs: Array.from(vcMap.values()),
//     startups,
//   }
// }

// // Main fetch function - reverted to use API endpoints
// export async function fetchCSVData() {
//   log("Starting fetchCSVData")

//   // Check cache first
//   const cacheKey = "csv-data-main"
//   const cachedData = dataCache.get(cacheKey)
//   if (cachedData) {
//     log("Using cached main CSV data:", {
//       vcsCount: cachedData.vcs?.length || 0,
//       startupsCount: cachedData.startups?.length || 0,
//     })
//     return cachedData
//   }

//   try {
//     log("Fetching CSV from API endpoint...")
//     const response = await fetch("/api/csv-data", {
//       cache: "no-store",
//       headers: {
//         "Cache-Control": "no-cache",
//       },
//     })

//     if (!response.ok) {
//       const errorText = await response.text()
//       log("API error response:", errorText)
//       throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}\n${errorText}`)
//     }

//     const csvText = await response.text()
//     if (!csvText || csvText.trim().length === 0) {
//       throw new Error("Received empty CSV data")
//     }

//     // Process CSV in chunks for better performance
//     const { vcs, startups } = await processCSVInChunks(csvText)

//     log("Processing complete:", {
//       uniqueVCs: vcs.length,
//       totalStartups: startups.length,
//     })

//     // Fetch additional data in parallel
//     const [nonQualifiedStartups, giveawayData] = await Promise.allSettled([
//       fetchNonQualifiedStartups(),
//       fetchGiveawayData(),
//     ])

//     const result = {
//       vcs,
//       startups,
//       nonQualifiedStartups: nonQualifiedStartups.status === "fulfilled" ? nonQualifiedStartups.value : [],
//       giveawayData: giveawayData.status === "fulfilled" ? giveawayData.value : [],
//     }

//     // Cache the result
//     dataCache.set(cacheKey, result)

//     return result
//   } catch (error) {
//     log("Error in fetchCSVData:", error)
//     log("Error stack:", error instanceof Error ? error.stack : "No stack trace")

//     // Return fallback data
//     const fallbackResult = {
//       vcs: fallbackVCs,
//       startups: fallbackStartups,
//       nonQualifiedStartups: [],
//       giveawayData: [],
//     }

//     // Cache fallback data with shorter TTL
//     dataCache.set(cacheKey, fallbackResult)
//     return fallbackResult
//   }
// }

// // Fetch non-qualified startups - reverted to API endpoint
// async function fetchNonQualifiedStartups(): Promise<NonQualifiedStartupData[]> {
//   const cacheKey = "non-qualified-startups"
//   const cached = dataCache.get(cacheKey)
//   if (cached) return cached

//   try {
//     const response = await fetch("/api/nonqualified-csv", {
//       cache: "no-store",
//       headers: { "Cache-Control": "no-cache" },
//     })

//     if (!response.ok) {
//       log("Failed to fetch non-qualified portfolio CSV, continuing without it")
//       return []
//     }

//     const csvText = await response.text()
//     if (!csvText || csvText.trim().length === 0) {
//       return []
//     }

//     const results = Papa.parse(csvText, {
//       header: true,
//       skipEmptyLines: true,
//     })

//     if (!results.data || !Array.isArray(results.data) || results.data.length === 0) {
//       return []
//     }

//     const nonQualifiedStartups: NonQualifiedStartupData[] = []

//     results.data.forEach((row: any) => {
//       try {
//         const vcName = row["VC Name"]
//         const startupName = row["Startup Name"]
//         if (!vcName || !startupName) return

//         const vcId = `vc-${vcName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
//         const startupId = `nonqualified-${startupName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`

//         nonQualifiedStartups.push({
//           id: startupId,
//           name: startupName,
//           website: row["Startup Website"] || "",
//           vcId: vcId,
//           companyScore: row["Company Score"] || "",
//         })
//       } catch (err) {
//         log(`Error processing non-qualified startup:`, err)
//       }
//     })

//     log(`Processed ${nonQualifiedStartups.length} non-qualified startups`)
//     dataCache.set(cacheKey, nonQualifiedStartups)
//     return nonQualifiedStartups
//   } catch (err) {
//     log("Error processing non-qualified portfolio CSV:", err)
//     return []
//   }
// }

// // Fetch giveaway data - reverted to API endpoint
// async function fetchGiveawayData(): Promise<GiveawayVentureData[]> {
//   const cacheKey = "giveaway-data"
//   const cached = dataCache.get(cacheKey)
//   if (cached) return cached

//   try {
//     const response = await fetch("/api/giveaway-csv", {
//       cache: "no-store",
//       headers: { "Cache-Control": "no-cache" },
//     })

//     if (!response.ok) {
//       log(`Failed to fetch giveaway portfolio CSV: ${response.status} ${response.statusText}`)
//       return []
//     }

//     const csvText = await response.text()
//     if (!csvText || csvText.trim().length === 0) {
//       return []
//     }

//     const results = Papa.parse(csvText, {
//       header: true,
//       skipEmptyLines: true,
//     })

//     if (!results.data || !Array.isArray(results.data) || results.data.length === 0) {
//       return []
//     }

//     const giveawayData: GiveawayVentureData[] = []

//     results.data.forEach((row: any, index: number) => {
//       try {
//         const vcName = row["VC name"] || row["vc name"] || row["VC Name"] || ""
//         const vcDomain = row["VC domain"] || row["vc domain"] || row["VC Domain"] || ""

//         const suggestedCompaniesStr =
//           row["Suggested Companies"] || row["suggested companies"] || row["Suggested companies"] || ""
//         const suggestedCompanies = suggestedCompaniesStr
//           ? suggestedCompaniesStr.split(",").map((s: string) => s.trim())
//           : []

//         const startupDomainsStr = row["Startup domain"] || row["startup domain"] || row["Startup Domain"] || ""
//         const startupDomains = startupDomainsStr ? startupDomainsStr.split(";").map((s: string) => s.trim()) : []

//         const gptReasoningsStr = row["GPT Reasoning"] || row["gpt reasoning"] || row["GPT reasoning"] || ""
//         const gptReasonings = gptReasoningsStr
//           ? gptReasoningsStr.includes("|")
//             ? gptReasoningsStr.split("|").map((s: string) => s.trim())
//             : gptReasoningsStr.split(". ").map((s: string) => s.trim())
//           : []

//         if (!vcName || !vcDomain || suggestedCompanies.length === 0) {
//           return
//         }

//         const suggestedStartups: GiveawayStartupData[] = []
//         for (let i = 0; i < suggestedCompanies.length; i++) {
//           const reasoning = i < gptReasonings.length ? gptReasonings[i] : `Suggested match for ${vcName}`

//           suggestedStartups.push({
//             name: suggestedCompanies[i],
//             domain: i < startupDomains.length ? startupDomains[i] : "",
//             reasoning: reasoning,
//           })
//         }

//         giveawayData.push({
//           vcName,
//           vcDomain,
//           suggestedStartups,
//         })
//       } catch (err) {
//         log(`Error processing giveaway data in row ${index}:`, err)
//       }
//     })

//     dataCache.set(cacheKey, giveawayData)
//     return giveawayData
//   } catch (err) {
//     log("Error processing giveaway portfolio CSV:", err)
//     return []
//   }
// }

// // Utility functions
// export function getStartupsForVC(startups: StartupData[], vcId: string): StartupData[] {
//   return startups.filter((startup) => startup.vcId === vcId)
// }

// export function getGiveawayDataForVC(giveawayData: GiveawayVentureData[], vcWebsite: string) {
//   console.log("getGiveawayDataForVC called with:", {
//     dataCount: giveawayData?.length || 0,
//     vcWebsite,
//   })

//   if (!giveawayData || !Array.isArray(giveawayData) || giveawayData.length === 0) {
//     console.log("No giveaway data available")
//     return undefined
//   }

//   if (!vcWebsite) {
//     console.log("No VC website provided")
//     return undefined
//   }

//   // Clean the domain by removing http://, https://, www., and trailing slashes
//   const cleanDomain = (url: string) => {
//     if (!url) return ""
//     return url
//       .replace(/^(https?:\/\/)?(www\.)?/, "")
//       .replace(/\/+$/, "")
//       .toLowerCase()
//       .trim()
//   }

//   const cleanedVcWebsite = cleanDomain(vcWebsite)
//   console.log("Cleaned VC website:", cleanedVcWebsite)

//   // Try to find an exact match first
//   const matchedData = giveawayData.find((data) => {
//     const cleanedDataDomain = cleanDomain(data.vcDomain)
//     return cleanedDataDomain === cleanedVcWebsite
//   })

//   if (matchedData) {
//     console.log("Found exact domain match:", matchedData.vcName)
//     return matchedData
//   }

//   console.log("No matching giveaway data found for:", cleanedVcWebsite)
//   return undefined
// }

// export function sortVCsByPortfolioScore(vcs: VentureData[]): VentureData[] {
//   return vcs.sort((a, b) => (b.portfolioCompanyScore || 0) - (a.portfolioCompanyScore || 0))
// }

// // Get all unique states and cities for filtering
// export function getLocations(data: (VentureData | StartupData)[]): {
//   states: string[]
//   cities: string[]
// } {
//   const states = new Set<string>()
//   const cities = new Set<string>()

//   data.forEach((item) => {
//     if (item.state && item.state !== "Unknown" && item.state.trim()) {
//       states.add(item.state.trim())
//     }
//     if (item.city && item.city !== "Unknown" && item.city.trim()) {
//       cities.add(item.city.trim())
//     }
//   })

//   return {
//     states: Array.from(states).sort(),
//     cities: Array.from(cities).sort(),
//   }
// }

// // Filter data by location
// export function filterDataByLocation(
//   data: (VentureData | StartupData)[],
//   filterType: "city" | "state" | null,
//   filterValue: string | null,
// ): (VentureData | StartupData)[] {
//   if (!filterType || !filterValue) return data

//   return data.filter((item) => {
//     if (filterType === "city") {
//       return item.city === filterValue
//     }
//     if (filterType === "state") {
//       return item.state === filterValue
//     }
//     return true
//   })
// }

// // Deduplicate startups by name
// export function deduplicateStartups(startups: StartupData[]): StartupData[] {
//   const uniqueStartups = new Map<string, StartupData>()

//   startups.forEach((startup) => {
//     if (!uniqueStartups.has(startup.name)) {
//       uniqueStartups.set(startup.name, startup)
//     }
//   })

//   return Array.from(uniqueStartups.values())
// }

// // Get non-qualified startups for a specific VC
// export function getNonQualifiedStartupsForVC(
//   nonQualifiedStartups: NonQualifiedStartupData[],
//   vcId: string,
// ): NonQualifiedStartupData[] {
//   return nonQualifiedStartups.filter((startup) => startup.vcId === vcId)
// }

// // Pagination interfaces and function
// interface PaginationOptions {
//   page?: number
//   limit?: number
//   filterType?: "state" | "city" | null
//   location?: string | null
// }

// interface PaginatedVCsResult {
//   vcs: VentureData[]
//   totalItems: number
//   totalPages: number
// }

// // Cache for parsed CSV data to avoid re-parsing on every request
// let cachedVentureData: VentureData[] | null = null
// let cacheTimestamp = 0
// const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// export async function getPaginatedVCs(options: PaginationOptions = {}): Promise<PaginatedVCsResult> {
//   const { page = 1, limit = 20, filterType = null, location = null } = options

//   // Check if we have valid cached data
//   const now = Date.now()
//   if (!cachedVentureData || now - cacheTimestamp > CACHE_DURATION) {
//     try {
//       // CHANGE: Fetch directly from S3 for server-side calls
//       log("Fetching CSV directly from S3 for server-side pagination...")
//       const csvUrl = "https://vc-dashboard-data.s3.us-east-2.amazonaws.com/portfolio_qualified.csv"

//       const response = await fetch(csvUrl, {
//         cache: "no-store",
//         headers: {
//           "Cache-Control": "no-cache",
//         },
//       })

//       if (!response.ok) {
//         throw new Error(`Failed to fetch CSV from S3: ${response.status} ${response.statusText}`)
//       }

//       const csvText = await response.text()
//       if (!csvText || csvText.trim().length === 0) {
//         throw new Error("Received empty CSV data from S3")
//       }

//       // Process CSV in chunks for better performance
//       const { vcs, startups } = await processCSVInChunks(csvText)

//       cachedVentureData = vcs
//       cacheTimestamp = now
//     } catch (error) {
//       log("Error fetching CSV data for pagination:", error)
//       throw error
//     }
//   }

//   if (!cachedVentureData) {
//     throw new Error("No VC data available")
//   }

//   // Apply filters
//   let filteredVCs = [...cachedVentureData]

//   if (filterType && location) {
//     const locations = location.split(",").map((loc) => loc.trim())
//     filteredVCs = filteredVCs.filter((vc) => {
//       if (filterType === "city") {
//         return locations.includes(vc.city)
//       }
//       if (filterType === "state") {
//         return locations.includes(vc.state)
//       }
//       return true
//     })
//   }

//   // Sort by portfolio company score
//   filteredVCs = sortVCsByPortfolioScore(filteredVCs)

//   // Apply pagination
//   const totalItems = filteredVCs.length
//   const totalPages = Math.ceil(totalItems / limit)
//   const startIndex = (page - 1) * limit
//   const endIndex = startIndex + limit
//   const paginatedVCs = filteredVCs.slice(startIndex, endIndex)

//   return {
//     vcs: paginatedVCs,
//     totalItems,
//     totalPages,
//   }
// }

// // Add getAllStartups function for compatibility
// export async function getAllStartups() {
//   try {
//     const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/startups`, {
//       cache: "no-store",
//     })

//     if (!response.ok) {
//       throw new Error(`Failed to fetch startups: ${response.status}`)
//     }

//     const data = await response.json()
//     return data.startups || []
//   } catch (error) {
//     console.error("Error fetching all startups:", error)
//     return []
//   }
// }

// // Export cache instance for debugging
// export { dataCache }
