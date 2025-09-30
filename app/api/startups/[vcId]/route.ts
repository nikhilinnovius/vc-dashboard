import { type NextRequest, NextResponse } from "next/server"
import { fetchCSVData, getStartupsForVC } from "@/lib/data-utils"

// Force dynamic rendering
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest, { params }: { params: { vcId: string } }) {
  try {
    const vcId = params.vcId

    if (!vcId) {
      return NextResponse.json({ error: "VC ID is required" }, { status: 400 })
    }

    // Fetch all data
    const csvData = await fetchCSVData()

    // Get startups for this specific VC
    const startups = getStartupsForVC(csvData.startups, vcId)

    return NextResponse.json({ startups })
  } catch (error) {
    console.error("Error fetching startups for VC:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
