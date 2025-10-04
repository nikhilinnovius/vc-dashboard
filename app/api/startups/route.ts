import { NextRequest, NextResponse } from "next/server"
import { fetchCSVData } from "@/lib/data-utils"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1", 10)
    const limit = Number.parseInt(searchParams.get("limit") || "50", 10)
    const filterType = searchParams.get("filterType") as "state" | "city" | null
    const location = searchParams.get("location")

    // Validate parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json({ error: "Invalid pagination parameters" }, { status: 400 })
    }

    // Get data from CSV
    const data = await fetchCSVData()
    let filteredStartups = data.startups || []

    // Apply location filter if provided
    if (filterType && location) {
      const locations = location.split(",").map((loc) => loc.trim())
      filteredStartups = filteredStartups.filter((startup) => {
        if (filterType === "city") {
          return locations.includes(startup.city)
        }
        if (filterType === "state") {
          return locations.includes(startup.state)
        }
        return true
      })
    }

    // Deduplicate startups by name
    const uniqueStartups = new Map()
    filteredStartups.forEach((startup) => {
      if (!uniqueStartups.has(startup.name)) {
        uniqueStartups.set(startup.name, startup)
      }
    })
    filteredStartups = Array.from(uniqueStartups.values())

    // Sort by company score
    filteredStartups.sort((a, b) => {
      const scoreA = a.companyScore ? Number.parseFloat(a.companyScore) : 0
      const scoreB = b.companyScore ? Number.parseFloat(b.companyScore) : 0
      return scoreB - scoreA
    })

    // Apply pagination
    const totalItems = filteredStartups.length
    const totalPages = Math.ceil(totalItems / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedStartups = filteredStartups.slice(startIndex, endIndex)

    return NextResponse.json({
      startups: paginatedStartups,
      totalItems,
      totalPages,
      currentPage: page,
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    })
  } catch (error) {
    console.error("Error in /api/startups:", error)
    return NextResponse.json(
      { error: "Failed to fetch startups", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
