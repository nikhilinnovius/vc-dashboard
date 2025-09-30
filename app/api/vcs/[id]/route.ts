import { NextRequest, NextResponse } from "next/server"
import Papa from "papaparse"

// Force dynamic rendering
export const dynamic = "force-dynamic"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vcId = params.id

    if (!vcId) {
      return NextResponse.json({ error: "VC ID is required" }, { status: 400 })
    }

    // Fetch CSV data from S3
    const response = await fetch("https://vc-dashboard-data.s3.us-east-2.amazonaws.com/portfolio_qualified.csv")

    if (!response.ok) {
      throw new Error(`S3 fetch failed: ${response.status}`)
    }

    const csvText = await response.text()
    
    // Parse CSV data
    const parseResult = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    })

    if (parseResult.errors.length > 0) {
      console.error("CSV parsing errors:", parseResult.errors)
      return NextResponse.json({ error: "Failed to parse CSV data" }, { status: 500 })
    }

    const vcs = parseResult.data as any[]

    // Find the specific VC by ID
    const vc = vcs.find((vc) => vc.id === vcId)

    if (!vc) {
      return NextResponse.json({ error: "VC not found" }, { status: 404 })
    }

    // Transform the VC data to match the expected format
    const transformedVC = {
      id: vc.id,
      name: vc.name,
      city: vc.city,
      state: vc.state,
      website: vc.website,
      description: vc.description,
      logo: vc.logo,
      vcScore: vc.vc_score ? Number(vc.vc_score) : 0,
      aum: vc.aum,
      stageDistribution: vc.stage_distribution,
      inAffinity: vc.in_affinity === "true" || vc.in_affinity === true,
      numberOfPortfolioCompanies: vc.numberOfPortfolioCompanies ? Number(vc.numberOfPortfolioCompanies) : 0,
    }

    return NextResponse.json({ vc: transformedVC })
  } catch (error) {
    console.error("Error fetching VC by ID:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

